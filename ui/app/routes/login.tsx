import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Role } from "~/types";

const Page = () => {
  const [role, setRole] = useState<Role>();
  const [isRedirectingToProject, setIsRedirectingToProject] =
    useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-auto py-8 bg-slate-200">
      <Card className="max-w-md mx-auto mt-24">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
        </CardHeader>
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

              if (role) {
                document.cookie = `role=${role}`;
              }

              if (role == Role.GRADUATE_ENGINEER) {
                navigate("/");
              } else {
                try {
                  setIsRedirectingToProject(true);
                  navigate(`/projects`);
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
