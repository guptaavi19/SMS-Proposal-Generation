import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { ClientOnly } from "remix-utils/client-only";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { http } from "~/lib/utils";
import { GetSectionsResponse, Section } from "~/types";
import JoditEditor from "~/components/jodit.client";

type Params = {
  projectId: string;
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  let sections: Section[] = [];
  const { projectId } = params as Params;

  try {
    const res = await http.get<GetSectionsResponse>(
      `/projects/${projectId}/sections`
    );

    sections = res.data.data.sections;
  } catch (e) {
    console.log(e);
  }

  return {
    sections,
  };
};

const Page = () => {
  const { sections } = useLoaderData<typeof loader>();

  return (
    <div className="grid grid-cols-12 min-h-screen p-4 gap-4 bg-slate-200">
      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Comprehensive Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-8">
              <ClientOnly
                fallback={
                  <div className="flex justify-center">
                    <Loader2 className="animate-spin h-10 w-10" />
                  </div>
                }
              >
                {() => (
                  <div>
                    <JoditEditor
                      value={sections.join("\n")}
                      config={{
                        readonly: true,
                      }}
                    />
                  </div>
                )}
              </ClientOnly>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
