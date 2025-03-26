import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeftCircle, Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import JoditEditor from "jodit-react";
import { marked } from "marked";
import { http } from "@/lib/utils";
import { Section } from "@/types";

export type GetSectionsResponse = {
  data: {
    sections: Section[];
  };
};

export type GetSectionResponse = {
  data: {
    section: Section;
  };
};

const Page = () => {
  const [sectionContent, setSectionContent] = useState<string>("");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const { projectId, sectionId } = useParams();

  const projectSectionQuery = useQuery({
    queryKey: ["projects", projectId, "sections", sectionId],
    queryFn: async ({ queryKey }) => {
      const res = await http.get<GetSectionResponse>(
        `/projects/${queryKey[1]}/sections/${queryKey[3]}`
      );

      return res.data;
    },
  });

  const projectSectionsQuery = useQuery({
    queryKey: ["projects", projectId, "sections"],
    queryFn: async ({ queryKey }) => {
      const res = await http.get<GetSectionsResponse>(
        `/projects/${queryKey[1]}/sections`
      );

      return res.data;
    },
  });

  useEffect(() => {
    (async () => {
      if (projectSectionQuery.data) {
        let htmlContent = await marked(
          projectSectionQuery.data.data.section.response
        );
        setSectionContent(htmlContent);
      }
    })();
  }, [projectSectionQuery.data]);

  if (projectSectionsQuery.error) {
    toast.error("Error fetching project sections.");
    return null;
  }

  return (
    <>
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
                {(() => {
                  if (projectSectionsQuery.isFetching) {
                    return (
                      <div className="flex flex-col items-center jusitfy-center space-y-2 mt-10">
                        <Loader2 className="animate-spin" />
                        <div>Loading sections...</div>
                      </div>
                    );
                  }

                  if (
                    projectSectionsQuery.error ||
                    !projectSectionsQuery.data
                  ) {
                    return (
                      <div className="flex justify-center text-destructive mt-10">
                        Something went wrong, please try again.
                      </div>
                    );
                  }

                  return projectSectionsQuery.data.data.sections.map(
                    (section, i) => {
                      return (
                        <div key={i}>
                          <Link
                            to={`/projects/${section.projectId}/sections/${section.id}`}
                            className={buttonVariants({
                              variant:
                                sectionId === section.id ? "default" : "ghost",
                              className: "w-full justify-start rounded-lg",
                            })}
                          >
                            {section.displayName}
                          </Link>
                        </div>
                      );
                    }
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-9">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {(() => {
                  if (projectSectionQuery.isFetching) {
                    return (
                      <div className="flex justify-center">
                        <Loader2 className="animate-spin" />
                      </div>
                    );
                  }

                  if (projectSectionQuery.error || !projectSectionQuery.data) {
                    return (
                      <div className="text-destructive">
                        Something went wrong, please try again.
                      </div>
                    );
                  }

                  return projectSectionQuery.data.data.section.displayName;
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
    </>
  );
};

export default Page;
