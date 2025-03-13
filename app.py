from flask import Flask,request, jsonify
import openai
import os
from docx import Document
import time
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential
from azure.search.documents.indexes import SearchIndexClient
import chromadb

app=Flask(__name__)

AZURE_OPENAI_API_KEY = "CGWKnvaYfp1vhGr48poKNXYUoItTbnQe3IrFOnyEeyx2f6wffqFEJQQJ99BBACHYHv6XJ3w3AAAAACOGxz08"
AZURE_OPENAI_ENDPOINT = "https://rfp-demo-001.openai.azure.com/"
AZURE_OPENAI_API_VERSION = "2024-06-01"
AZURE_OPENAI_DEPLOYMENT_NAME = "gpt-4o"

SEARCH_ADMIN_KEY = "j9bu4JN0rCWsDgaeQkShE5mL2iwwIV0YkUq1rRAhzCAzSeDBPmYq"
SEARCH_ENDPOINT = "https://rfp-demo.search.windows.net"
INDEX_NAME = "sms_proposal"
credential = AzureKeyCredential(SEARCH_ADMIN_KEY)
search_client = SearchClient(endpoint=SEARCH_ENDPOINT, index_name=INDEX_NAME, credential=credential)
index_client = SearchIndexClient(endpoint=SEARCH_ENDPOINT, credential=credential)

azure_vm_ip = "4.213.164.175"  
port = 8000 
client = chromadb.Client()
collection_name = "proposal_embeddings"
collection = client.create_collection(collection_name)

db_path = 'chroma_db'  # Replace with the desired directory path
if not os.path.exists(db_path):
    os.makedirs(db_path)

def extract_text_from_docx(file_path):
    doc = Document(file_path)
    text = []
    for para in doc.paragraphs:
        text.append(para.text)
    return "\n".join(text)


def generate_embedding(text, model="text-embedding-ada-002"):
    client = openai.AzureOpenAI(
        api_key=AZURE_OPENAI_API_KEY,
        azure_endpoint=AZURE_OPENAI_ENDPOINT,
        api_version=AZURE_OPENAI_API_VERSION
    )
    response = client.embeddings.create(model=model, input=text)
    embedding = response.data[0].embedding
    # print("embeddings ====>>>>", embedding)
    if not embedding:
        raise ValueError("Generated embedding is empty or None")
    return embedding


def store_document_in_chroma(text):
    embedding = generate_embedding(text)
    doc_id = str(int(time.time() * 1000))  

    
    print(f"Document Text: {text}")
    print(f"Generated Embedding: {embedding}")

    
    documents = [text]  
    ids = [doc_id]  
    metadatas = [{"id": doc_id}]  
    embeddings = [embedding]  

    # Check the lengths of all lists before adding to ChromaDB
    if len(documents) != len(ids) or len(documents) != len(metadatas) or len(documents) != len(embeddings):
        raise ValueError("Mismatch in the length of documents, ids, metadatas, and embeddings")

    try:

        response = collection.add(
            documents=documents,         
            ids=ids,                    
            metadatas=metadatas,         
            embeddings=embeddings        
        )

        print(f"ChromaDB Response: {response}")

        # After storing, query to check embeddings are stored correctly
        query_response = collection.query(
            query_embeddings=[embedding],  
            include=["embeddings"]         
        )

        print(f"Query Response: {query_response}")
        return {"message": "Document stored in ChromaDB successfully", "id": doc_id}
    except Exception as e:
        print(f"Error storing document: {e}")
        return {"error": f"Error storing document: {str(e)}"}


# def store_document_in_search(text):
#     embedding = generate_embedding(text)
#     doc_id = str(int(time.time() * 1000))
#     document = {"id": doc_id, "text": text, "embeddings": embedding}
#     search_client.upload_documents([document])
#     return {"message": "Document stored successfully", "id": doc_id}

@app.route('/')
def hello():
    return "hello world"


@app.route('/generate-proposal', methods=['POST'])
def generate_proposal():
    # Get parameters from the request
    report_type = request.form.get('report_type')
    customer_name = request.form.get('customer_name')
    project_name = request.form.get('project_name')
    project_number = request.form.get('project_number')
    location = request.form.get('location')

    meeting_minutes = request.files.get('meeting_minutes')
    overview_map = request.files.get('overview_map')

    # Generate the proposal prompt with specific sections
    prompt = f"""
    Generate a detailed proposal with the following sections:

    1. Executive Summary
    2. Introduction
    3. Project Background
    4. Purpose
    5. Scope

    The following project details should be included in each section:

    - Report Type: {report_type}
    - Customer: {customer_name}
    - Project Name: {project_name}
    - Project Number: {project_number}
    - Location: {location}

    Additionally, the following documents are provided:
    1) Meeting Minutes: {meeting_minutes.filename if meeting_minutes else "Not provided"}
    2) Overview Map: {overview_map.filename if overview_map else "Not provided"}

    Please generate each section in a detailed manner based on the provided information.
    """

    client = openai.AzureOpenAI(
        api_key=AZURE_OPENAI_API_KEY,
        azure_endpoint=AZURE_OPENAI_ENDPOINT,
        api_version=AZURE_OPENAI_API_VERSION
    )

    # Generate the completion from OpenAI
    completion = client.chat.completions.create(
        model=AZURE_OPENAI_DEPLOYMENT_NAME,
        messages=[
            {"role": "system", "content": "You are an expert in drafting professional proposals."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1200, 
        temperature=0.7,
    )

    response_text = completion.choices[0].message.content if completion.choices else "No response generated."

    sections = {
        "Executive Summary": "",
        "Introduction": "",
        "Project Background": "",
        "Purpose": "",
        "Scope": ""
    }

    
    section_order = ["Executive Summary", "Introduction", "Project Background", "Purpose", "Scope"]
    current_section = None
    for line in response_text.split("\n"):
        for section in section_order:
            if section in line:  
                current_section = section
                sections[section] = line.strip()  # Start the section
                break
        if current_section and line.strip() and line.strip() != current_section:
            sections[current_section] += "\n" + line.strip()

    return jsonify({"sections": sections})


@app.route('/update-section', methods=['POST'])
def update_section():
   
    section_name = request.form.get('section_name')
    user_prompt = request.form.get('user_prompt')

    
    report_type = request.form.get('report_type')
    customer_name = request.form.get('customer_name')
    project_name = request.form.get('project_name')
    project_number = request.form.get('project_number')
    location = request.form.get('location')

    # Get the current content of the section
    section_content = request.form.get('section_content')  

    # Get filenames for Meeting Minutes and Overview Map
    meeting_minutes = request.form.get('meeting_minutes')  
    overview_map = request.form.get('overview_map')        

    if not section_name or not user_prompt or not report_type or not customer_name or not project_name or not project_number or not location or not section_content:
        return jsonify({"error": "Missing section name, user prompt, project details, or section content"}), 400

    # Prepare the prompt for the selected section with context
    prompt = f"""
    The user has asked for a detailed update to the {section_name} section with the following prompt:
    {user_prompt}
    
    The current content of the {section_name} section is as follows:
    {section_content}
    
    Please consider the following project details when updating the section:
    - Report Type: {report_type}
    - Customer: {customer_name}
    - Project Name: {project_name}
    - Project Number: {project_number}
    - Location: {location}

    Additionally, the following documents are provided:
    - Meeting Minutes: {meeting_minutes if meeting_minutes else 'Not provided'}
    - Overview Map: {overview_map if overview_map else 'Not provided'}

    Provide a detailed response for the {section_name} section, ensuring that all the project-specific context, including documents and the existing content, is incorporated.
    """

   
    client = openai.AzureOpenAI(
        api_key=AZURE_OPENAI_API_KEY,
        azure_endpoint=AZURE_OPENAI_ENDPOINT,
        api_version=AZURE_OPENAI_API_VERSION
    )

    try:
       
        completion = client.chat.completions.create(
            model=AZURE_OPENAI_DEPLOYMENT_NAME,
            messages=[
                {"role": "system", "content": "You are an expert in drafting professional proposals."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,  
            temperature=0.7,
        )

        updated_section = completion.choices[0].message.content if completion.choices else "No response generated."

        return jsonify({"updated_section": updated_section})

    except Exception as e:
        return jsonify({"error": f"An error occurred while updating the section: {str(e)}"}), 500


@app.route('/upload-doc', methods=['POST'])
def upload_doc():
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    upload_folder = 'uploads'
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    file_path = os.path.join(upload_folder, file.filename)
    file.save(file_path)

    doc_text = extract_text_from_docx(file_path)
    response = store_document_in_chroma(doc_text)

    return jsonify(response)

@app.route('/get-docs', methods=['GET'])
def get_docs():
    try:
        # Query ChromaDB collection to get all documents, metadata, and embeddings
        all_documents = collection.get()

        # Log the retrieved documents and embeddings
        print("Retrieved documents:", all_documents)

      

        document_count = len(all_documents['documents'])
        docs_with_contents_and_embeddings = []
        for idx, doc in enumerate(all_documents['documents']):
            doc_data = {
                'id': all_documents['metadatas'][idx]['id'],
                'content': doc,
                'embedding': all_documents['embeddings'][idx]
            }
            docs_with_contents_and_embeddings.append(doc_data)

        return jsonify({
            "document_count": document_count,
            "documents": docs_with_contents_and_embeddings
        })

    except Exception as e:
        print(f"Error retrieving documents: {e}")
        return jsonify({"error": f"Error retrieving documents: {str(e)}"})


if __name__ == '__main__':
    app.run(debug=True)