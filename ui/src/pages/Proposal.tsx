import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ChevronLeftCircle, Loader, Loader2, Pencil } from "lucide-react";
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
  const [isSectionLinkLoading, setIsSectionLinkLoading] = useState<{
    sectionIndex: number;
  } | null>(null);
  const [sectionContent, setSectionContent] = useState<string>("");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [searchParams] = useSearchParams();
  const { projectId, sectionId } = useParams();
  const navigate = useNavigate();

  // const { data, error } = useQuery({
  //   queryKey: [
  //     "proposal-section",
  //     id,
  //     sections[Number(searchParams.get("section"))].label,
  //   ],
  //   queryFn: async () => {
  //     const res = await axios.get<GetProposalSectionResponse>(
  //       `${
  //         import.meta.env.VITE_API_URL
  //       }/get-proposal-section?proposal_id=${id}&section_name=${
  //         sections[Number(searchParams.get("section"))].label
  //       }`
  //     );

  //     return res.data;
  //   },
  // });

  // const aiRevision = useMutation({
  //   mutationFn: async ({ userPrompt }: { userPrompt: string }) => {
  //     let idx = searchParams.get("section");
  //     if (!idx) {
  //       idx = "0";
  //     }

  //     let sectionName = sections[Number(idx)].label;

  //     const formData = new FormData();

  //     formData.append("proposal_id", id!);
  //     formData.append("section_name", sectionName);
  //     formData.append("user_prompt", userPrompt);

  //     const res = await axios.post<AiRevisionResponse>(
  //       `${import.meta.env.VITE_API_URL}/generate-section`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "application/x-www-form-urlencoded",
  //         },
  //       }
  //     );

  //     return res.data;
  //   },
  //   onSuccess: ({ content }) => {
  //     let idx = searchParams.get("section");
  //     if (!idx) {
  //       idx = "0";
  //     }

  //     let sectionName: string = "";

  //     toast.success(`Section '${sectionName}' updated.`);
  //     setSectionContent(content);
  //     setUserPrompt("");
  //   },
  //   onError: () => {
  //     toast.error("Something went wrong, please try again.");
  //   },
  // });

  // if (error) {
  //   toast.error("Something went wrong, please try again.");

  //   return null;
  // }

  // useEffect(() => {
  //   (async () => {
  //     if (data) {
  //       let htmlContent = await marked(data.content);
  //       setSectionContent(htmlContent);
  //     }
  //   })();
  // }, [data]);

  // useEffect(() => {
  //   if (isSectionLinkLoading) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "auto";
  //   }
  //   return () => {
  //     document.body.style.overflow = "auto";
  //   };
  // }, [isSectionLinkLoading]);

  // return (
  //   <>
  //     {isSectionLinkLoading ? (
  //       <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
  //         <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
  //           <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
  //           <p className="mt-2 text-lg font-semibold">
  //             Generating content for{" "}
  //             {sections[isSectionLinkLoading.sectionIndex].label}. Please
  //             wait...
  //           </p>
  //         </div>
  //       </div>
  //     ) : null}

  //     <div className="grid grid-cols-12 min-h-screen p-4 gap-4">
  //       <div className="col-span-3 h-full">
  //         <Card className="h-full">
  //           <CardHeader className="flex items-center justify-between">
  //             <CardTitle>Sections</CardTitle>
  //             <Link to="/" className="block">
  //               <ChevronLeftCircle />
  //             </Link>
  //           </CardHeader>
  //           <CardContent>
  //             <div className="space-y-2">
  //               {sections.map((section, i) => {
  //                 return (
  //                   <div key={i}>
  //                     <Link
  //                       to={`/proposals/${id}?section=${i}`}
  //                       className={buttonVariants({
  //                         variant:
  //                           searchParams.get("section") === i.toString()
  //                             ? "default"
  //                             : "ghost",
  //                         className: "w-full justify-start rounded-lg",
  //                       })}
  //                       onClick={async (e) => {
  //                         e.preventDefault();

  //                         const res =
  //                           await axios.get<GetProposalSectionResponse>(
  //                             `${
  //                               import.meta.env.VITE_API_URL
  //                             }/get-proposal-section?proposal_id=${id}&section_name=${
  //                               sections[i].label
  //                             }`
  //                           );

  //                         if (!res.data || !res.data.content) {
  //                           setIsSectionLinkLoading({ sectionIndex: i });
  //                           try {
  //                             const formData = new FormData();

  //                             formData.append("proposal_id", id!);
  //                             formData.append("section_name", section.label);
  //                             formData.append("user_prompt", userPrompt);
  //                             formData.append("report_type", "HDPE");

  //                             await axios.post<AiRevisionResponse>(
  //                               `${
  //                                 import.meta.env.VITE_API_URL
  //                               }/generate-section`,
  //                               formData,
  //                               {
  //                                 headers: {
  //                                   "Content-Type":
  //                                     "application/x-www-form-urlencoded",
  //                                 },
  //                               }
  //                             );

  //                             navigate(`/proposals/${id}?section=${i}`);
  //                           } catch (e) {
  //                             toast.error(
  //                               "Something went wrong, please try again..."
  //                             );
  //                           } finally {
  //                             setIsSectionLinkLoading(null);
  //                           }

  //                           return;
  //                         }

  //                         navigate(`/proposals/${id}?section=${i}`);
  //                       }}
  //                     >
  //                       {isSectionLinkLoading &&
  //                       isSectionLinkLoading.sectionIndex === i ? (
  //                         <>
  //                           <Loader2 className="animate-spin" />
  //                           Generating content, please wait...
  //                         </>
  //                       ) : (
  //                         section.label
  //                       )}
  //                     </Link>
  //                   </div>
  //                 );
  //               })}
  //             </div>
  //           </CardContent>
  //         </Card>
  //       </div>
  //       <div className="col-span-9">
  //         <Card>
  //           <CardHeader>
  //             <CardTitle className="text-center">
  //               {(() => {
  //                 let idx = searchParams.get("section");
  //                 if (!idx) {
  //                   idx = "0";
  //                 }

  //                 let section: string = "";

  //                 sections.forEach((s, i) => {
  //                   if (i.toString() === idx) {
  //                     section = s.label;
  //                   }
  //                 });

  //                 return section;
  //               })()}
  //             </CardTitle>
  //           </CardHeader>
  //           <CardContent>
  //             <div className="flex justify-center">
  //               <Pencil className="h-4 w-4" />
  //             </div>
  //             <div className="mt-8">
  //               <JoditEditor
  //                 value={sectionContent}
  //                 onChange={(newContent) => setSectionContent(newContent)}
  //               />
  //             </div>
  //             <div className="mt-8">
  //               <Label>AI Prompt</Label>
  //               <Textarea
  //                 rows={5}
  //                 className="mt-2"
  //                 value={userPrompt}
  //                 onChange={(e) => setUserPrompt(e.target.value)}
  //               />
  //             </div>
  //             <div className="mt-8 flex flex-col justify-center items-center space-y-3">
  //               <Button
  //               // onClick={() => {
  //               //   aiRevision.mutate({
  //               //     userPrompt,
  //               //   });
  //               // }}
  //               >
  //                 {/* {aiRevision.isPending
  //                 ? "Applying AI Revision..."
  //                 : "Apply AI Revision"} */}
  //                 Apply AI Revision
  //               </Button>
  //               <Button variant="secondary" disabled>
  //                 Finalize section
  //               </Button>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>
  //   </>
  // );

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

  if (
    !projectSectionQuery.isFetching &&
    projectSectionQuery.data?.data.section.response == ""
  ) {
    // generate section...
  }

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
      {isSectionLinkLoading ? (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="mt-2 text-lg font-semibold">
              {/* Generating content for{" "}
              {sections[isSectionLinkLoading.sectionIndex].label}. Please
              wait... */}
            </p>
          </div>
        </div>
      ) : null}

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

                {/* {sections.map((section, i) => {
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

                          const res =
                            await axios.get<GetProposalSectionResponse>(
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
                              formData.append("report_type", "HDPE");

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
                })} */}
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
