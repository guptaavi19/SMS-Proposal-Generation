import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ChevronLeftCircle, Loader2, Pencil } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
import JoditEditor from "jodit-react";
import { marked } from "marked";

const sections = [
  {
    label: "Executive Summary",
    href: "/",
  },
  {
    label: "Introduction",
    href: "/",
  },
  {
    label: "Project Background",
    href: "/",
  },
  {
    label: "Purpose",
    href: "/",
  },
  {
    label: "Scope",
    href: "/",
  },
  {
    label: "Abbreviations",
    href: "/",
  },
  {
    label: "Reference Material",
    href: "/",
  },
  {
    label: "System Description",
    href: "/",
  },
  {
    label: "Pipeline Design",
    href: "/",
  },
  {
    label: "Pipeline Specification",
    href: "/",
  },
  {
    label: "Location",
    href: "/",
  },
  {
    label: "Land Use",
    href: "/",
  },
  {
    label: "Location Class",
    href: "/",
  },
  {
    label: "Radiation Assessment",
    href: "/",
  },
  {
    label: "Safety Management Process",
    href: "/",
  },
  {
    label: "SMS Inputs",
    href: "/",
  },
  {
    label: "SMS Workshop",
    href: "/",
  },
  {
    label: "SMS Outputs",
    href: "/",
  },
];

type GetProposalSectionResponse = {
  proposal_id: string;
  section_name: string;
  content: string;
};

type AiRevisionResponse = {
  proposal_id: string;
  section: string;
  content: string;
};

const Page = () => {
  const [isSectionLinkLoading, setIsSectionLinkLoading] = useState<{
    sectionIndex: number;
  } | null>(null);
  const [sectionContent, setSectionContent] = useState<string>("");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, error } = useQuery({
    queryKey: [
      "proposal-section",
      id,
      sections[Number(searchParams.get("section"))].label,
    ],
    queryFn: async () => {
      const res = await axios.get<GetProposalSectionResponse>(
        `${
          import.meta.env.VITE_API_URL
        }/get-proposal-section?proposal_id=${id}&section_name=${
          sections[Number(searchParams.get("section"))].label
        }`
      );

      return res.data;
    },
  });

  const aiRevision = useMutation({
    mutationFn: async ({ userPrompt }: { userPrompt: string }) => {
      let idx = searchParams.get("section");
      if (!idx) {
        idx = "0";
      }

      let sectionName: string = "";

      const formData = new FormData();

      formData.append("proposal_id", id!);
      formData.append("section_name", sectionName);
      formData.append("user_prompt", userPrompt);

      const res = await axios.post<AiRevisionResponse>(
        `${import.meta.env.VITE_API_URL}/generate-section`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return res.data;
    },
    onSuccess: ({ content }) => {
      let idx = searchParams.get("section");
      if (!idx) {
        idx = "0";
      }

      let sectionName: string = "";

      toast.success(`Section '${sectionName}' updated.`);
      setSectionContent(content);
      setUserPrompt("");
    },
    onError: () => {
      toast.error("Something went wrong, please try again.");
    },
  });

  if (error) {
    toast.error("Something went wrong, please try again.");

    return null;
  }

  useEffect(() => {
    (async () => {
      if (data) {
        let htmlContent = await marked(data.content);
        setSectionContent(htmlContent);
      }
    })();
  }, [data]);

  return (
    <div className="grid grid-cols-12 min-h-screen p-4 gap-4">
      <div className="col-span-3 h-full">
        <Card className="h-full">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Sections</CardTitle>
            <Link to="/" className="block">
              <ChevronLeftCircle />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sections.map((section, i) => {
                return (
                  <div key={i}>
                    <Link
                      to={`/proposals/${id}?section=${i}`}
                      className={buttonVariants({
                        variant:
                          searchParams.get("section") === i.toString()
                            ? "default"
                            : "ghost",
                        className: "w-full justify-start rounded-lg",
                      })}
                      onClick={async (e) => {
                        e.preventDefault();

                        const res = await axios.get<GetProposalSectionResponse>(
                          `${
                            import.meta.env.VITE_API_URL
                          }/get-proposal-section?proposal_id=${id}&section_name=${
                            sections[i].label
                          }`
                        );

                        if (!res.data || !res.data.content) {
                          setIsSectionLinkLoading({ sectionIndex: i });
                          try {
                            const formData = new FormData();

                            formData.append("proposal_id", id!);
                            formData.append("section_name", section.label);
                            formData.append("user_prompt", userPrompt);

                            await axios.post<AiRevisionResponse>(
                              `${
                                import.meta.env.VITE_API_URL
                              }/generate-section`,
                              formData,
                              {
                                headers: {
                                  "Content-Type":
                                    "application/x-www-form-urlencoded",
                                },
                              }
                            );

                            navigate(`/proposals/${id}?section=${i}`);
                          } catch (e) {
                            toast.error(
                              "Something went wrong, please try again..."
                            );
                          } finally {
                            setIsSectionLinkLoading(null);
                          }

                          return;
                        }

                        navigate(`/proposals/${id}?section=${i}`);
                      }}
                    >
                      {isSectionLinkLoading &&
                      isSectionLinkLoading.sectionIndex === i ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Generating content, please wait...
                        </>
                      ) : (
                        section.label
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="col-span-9">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {(() => {
                let idx = searchParams.get("section");
                if (!idx) {
                  idx = "0";
                }

                let section: string = "";

                sections.forEach((s, i) => {
                  if (i.toString() === idx) {
                    section = s.label;
                  }
                });

                return section;
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Pencil className="h-4 w-4" />
            </div>
            <div className="mt-8">
              <JoditEditor
                value={sectionContent}
                onChange={(newContent) => setSectionContent(newContent)}
              />
            </div>
            <div className="mt-8">
              <Label>AI Prompt</Label>
              <Textarea
                rows={5}
                className="mt-2"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
              />
            </div>
            <div className="mt-8 flex flex-col justify-center items-center space-y-3">
              <Button
              // onClick={() => {
              //   aiRevision.mutate({
              //     userPrompt,
              //   });
              // }}
              >
                {/* {aiRevision.isPending
                  ? "Applying AI Revision..."
                  : "Apply AI Revision"} */}
                Apply AI Revision
              </Button>
              <Button variant="secondary" disabled>
                Finalize section
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
