import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { http } from "~/lib/utils";
import { Project, Section } from "~/types";

export const loader = async () => {
  let projects: Project[] = [];

  try {
    const res = await http.get<{ data: { projects: Project[] } }>("/projects");
    projects = res.data.data.projects;
  } catch (e) {}

  return {
    projects,
  };
};

const Page = () => {
  const { projects } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-auto py-8 bg-slate-200">
      <Card className="max-w-md mx-auto mt-24">
        <CardHeader>
          <CardTitle>Select a Project</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 list-decimal list-inside">
            {projects.map((project, i) => {
              return (
                <li
                  key={i}
                  className="hover:underline cursor-pointer w-fit"
                  onClick={async () => {
                    const res = await http.get<{
                      data: { sections: Section[] };
                    }>(`/projects/${project.id}/sections`);

                    navigate(
                      `/projects/${project.id}/sections/${res.data.data.sections[0].id}`
                    );
                  }}
                >
                  {project.name} -{" "}
                  {new Intl.DateTimeFormat("en-AU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }).format(new Date(project.createdAt))}
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
