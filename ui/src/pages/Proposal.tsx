import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";

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

const Page = () => {
  return (
    <div className="grid grid-cols-12 min-h-screen p-4 gap-4">
      <div className="col-span-3 h-full">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sections.map((s, i) => {
                return (
                  <div key={i}>
                    <Button
                      className="w-full justify-start rounded-lg"
                      variant={
                        s.label === "Project Background" ? "default" : "ghost"
                      }
                    >
                      {s.label}
                    </Button>
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
            <CardTitle className="text-center">Project Background</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Pencil className="h-4 w-4" />
            </div>
            <div className="mt-8">
              <Textarea rows={5} />
            </div>
            <div className="mt-8">
              <Label>AI Prompt</Label>
              <Textarea rows={5} className="mt-2" />
            </div>
            <div className="mt-8 flex justify-center">
              <Button>Apply AI Revision</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
