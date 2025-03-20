import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ChevronLeftCircle, Pencil } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

// const sections = [
//   {
//     label: "Executive Summary",
//     href: "/",
//   },
//   {
//     label: "Introduction",
//     href: "/",
//   },
//   {
//     label: "Project Background",
//     href: "/",
//   },
//   {
//     label: "Purpose",
//     href: "/",
//   },
//   {
//     label: "Scope",
//     href: "/",
//   },
//   {
//     label: "Abbreviations",
//     href: "/",
//   },
//   {
//     label: "Reference Material",
//     href: "/",
//   },
//   {
//     label: "System Description",
//     href: "/",
//   },
//   {
//     label: "Pipeline Design",
//     href: "/",
//   },
//   {
//     label: "Pipeline Specification",
//     href: "/",
//   },
//   {
//     label: "Location",
//     href: "/",
//   },
//   {
//     label: "Land Use",
//     href: "/",
//   },
//   {
//     label: "Location Class",
//     href: "/",
//   },
//   {
//     label: "Radiation Assessment",
//     href: "/",
//   },
//   {
//     label: "Safety Management Process",
//     href: "/",
//   },
//   {
//     label: "SMS Inputs",
//     href: "/",
//   },
//   {
//     label: "SMS Workshop",
//     href: "/",
//   },
//   {
//     label: "SMS Outputs",
//     href: "/",
//   },
// ];

type GetProposalResponse = {
  proposal_id: string;
  sections: Record<string, string>;
};

type AiRevisionResponse = {
  proposal_id: string;
  updated_section: string;
};

const Page = () => {
  const [sectionContent, setSectionContent] = useState<string>("");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [searchParams] = useSearchParams();
  const { id } = useParams();

  const { data, error, isFetching } = useQuery({
    queryKey: ["proposals", id],
    queryFn: async () => {
      const res = await axios.get<GetProposalResponse>(
        `${import.meta.env.VITE_API_URL}/get-proposal?proposal_id=${id}`
      );

      return res.data;
    },
  });

  const aiRevision = useMutation({
    mutationFn: async ({ userPrompt }: { userPrompt: string }) => {
      if (!data) {
        throw "No data.";
      }

      let idx = searchParams.get("section");
      if (!idx) {
        idx = "0";
      }

      let sectionName: string = "";

      Object.keys(data.sections).forEach((s, i) => {
        if (i.toString() == idx) {
          sectionName = s;
        }
      });

      const res = await axios.post<AiRevisionResponse>(
        `${import.meta.env.VITE_API_URL}/update-section`,
        {
          proposal_id: id,
          section_name: sectionName,
          user_prompt: userPrompt,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return res.data;
    },
    onSuccess: ({ updated_section }) => {
      if (!data) {
        return;
      }

      let idx = searchParams.get("section");
      if (!idx) {
        idx = "0";
      }

      let sectionName: string = "";

      Object.keys(data.sections).forEach((s, i) => {
        if (i.toString() == idx) {
          sectionName = s;
        }
      });

      toast.success(`Section '${sectionName}' updated.`);
      setSectionContent(updated_section);
      setUserPrompt("");
    },
    onError: () => {
      toast.error("Something went wrong, please try again.");
    },
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    let idx = searchParams.get("section");
    if (!idx) {
      idx = "0";
    }

    let section: string = data.sections[0];

    Object.keys(data.sections).forEach((s, i) => {
      if (i.toString() == idx) {
        section = s;
      }
    });

    setSectionContent(data.sections[section]);
  }, [data]);

  if (isFetching) {
    return <div>Loading...</div>;
  }

  if (!data || error) {
    toast.error("Something went wrong, please reload the page.");
    return null;
  }

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
              {Object.keys(data.sections).map((s, i) => {
                return (
                  <div key={i}>
                    <Link
                      to={`/proposals/${data.proposal_id}?section=${i}`}
                      className={buttonVariants({
                        variant:
                          searchParams.get("section") === i.toString()
                            ? "default"
                            : "ghost",
                        className: "w-full justify-start rounded-lg",
                      })}
                    >
                      {s}
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

                let section;

                Object.keys(data.sections).forEach((s, i) => {
                  if (i.toString() == idx) {
                    section = s;
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
              <Textarea rows={5} value={sectionContent} />
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
            <div className="mt-8 flex justify-center">
              <Button
                variant="secondary"
                className="hover:text-background hover:bg-primary"
                onClick={() => {
                  aiRevision.mutate({
                    userPrompt,
                  });
                }}
              >
                {aiRevision.isPending
                  ? "Applying AI Revision..."
                  : "Apply AI Revision"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
