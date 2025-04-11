import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { http } from "~/lib/utils";
import { Project, Role, Section } from "~/types";

const Page = () => {
  const [role, setRole] = useState<Role>();
  const [isRedirectingToProject, setIsRedirectingToProject] =
    useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-auto py-8 bg-slate-200">
      <Card className="max-w-md mx-auto mt-24">
        <CardHeader>Log in</CardHeader>
        <CardContent>
          <Select
            onValueChange={(value) => {
              setRole(value as Role);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Role.GRADUATE_ENGINEER}>
                Graduate Engineer
              </SelectItem>
              <SelectItem value={Role.MECHANICAL_ENGINEER}>
                Mechanical Engineer
              </SelectItem>
              <SelectItem value={Role.LEAD_ENGINEER}>Lead Engineer</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            onClick={async (e) => {
              e.preventDefault();

              if (role == Role.GRADUATE_ENGINEER) {
                navigate("/");
              } else {
                try {
                  setIsRedirectingToProject(true);
                  const res1 = await http.get<{
                    data: { project: Project | null };
                  }>("/latest-project");

                  if (res1.data.data.project) {
                    const res2 = await http.get<{
                      data: { sections: Section[] };
                    }>(`/projects/${res1.data.data.project.id}/sections`);

                    navigate(
                      `/projects/${res1.data.data.project.id}/sections/${res2.data.data.sections[0].id}`
                    );
                  } else {
                    toast("No project found.");
                  }
                } catch (e) {
                } finally {
                  setIsRedirectingToProject(false);
                }
              }
            }}
            disabled={!role || isRedirectingToProject}
          >
            {isRedirectingToProject ? "Please wait" : "Log in"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;
