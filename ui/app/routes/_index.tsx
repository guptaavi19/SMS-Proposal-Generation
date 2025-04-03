import type { MetaFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { http } from "~/lib/utils";
import { Customer, Project, ReportType } from "~/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const formSchema = z.object({
  customerId: z.any(),
  reportType: z.any(),

  projectName: z.any(),
  projectNumber: z.any(),
  location: z.any(),

  originator: z.any(),
  reviewer: z.any(),
  approver: z.any(),

  meetingMinutes: z.any(),
  threatRegister: z.any(),
  closeOutRegister: z.any(),
  overviewMap: z.any(),
  landUseQuestionnaire: z.any(),
  billOfMaterial: z.any(),
});

type SaveProjectResponse = {
  message: string;
  data: {
    project: Project;
  };
};

export const loader = async () => {
  let reportTypes: ReportType[] = [];
  let customers: Customer[] = [];

  try {
    const [reportTypesRes, customersRes] = await Promise.all([
      await http.get<{ data: { reportTypes: ReportType[] } }>("/report-types"),
      await http.get<{ data: { customers: Customer[] } }>("/customers"),
    ]);

    reportTypes = reportTypesRes.data.data.reportTypes;
    customers = customersRes.data.data.customers;
  } catch (e) {
    console.log(e);
  }

  return {
    reportTypes,
    customers,
  };
};

const Page = () => {
  const { reportTypes, customers } = useLoaderData<typeof loader>();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      customerId: "",
      reportType: "",
      projectName: "",
      projectNumber: "",
      location: "",
      originator: "",
      reviewer: "",
      approver: "",
    },
  });
  const navigate = useNavigate();

  const saveProject = useMutation({
    mutationFn: async (payload: z.infer<typeof formSchema>) => {
      const formData = new FormData();
      formData.append("customer_id", payload.customerId);
      formData.append("report_type", payload.reportType);
      formData.append("project_name", payload.projectName);
      formData.append("project_number", payload.projectNumber);
      formData.append("project_location", payload.location);
      formData.append("originator", payload.originator);
      formData.append("reviewer", payload.reviewer);
      formData.append("approver", payload.approver);

      if (payload.meetingMinutes) {
        Array.from(payload.meetingMinutes as FileList).forEach((file) => {
          formData.append("meeting_minutes", file);
        });
      }

      if (payload.threatRegister) {
        Array.from(payload.threatRegister as FileList).forEach((file) => {
          formData.append("threat_register", file);
        });
      }

      if (payload.closeOutRegister) {
        Array.from(payload.closeOutRegister as FileList).forEach((file) => {
          formData.append("close_out_register", file);
        });
      }

      if (payload.overviewMap) {
        Array.from(payload.overviewMap as FileList).forEach((file) => {
          formData.append("overview_map", file);
        });
      }

      if (payload.landUseQuestionnaire) {
        Array.from(payload.landUseQuestionnaire as FileList).forEach((file) => {
          formData.append("land_use_questionnaire", file);
        });
      }

      if (payload.billOfMaterial) {
        Array.from(payload.billOfMaterial as FileList).forEach((file) => {
          formData.append("bill_of_material", file);
        });
      }

      const res = await http.post<SaveProjectResponse>("/projects", formData);

      return res.data;
    },
    onSuccess: ({ data }) => {
      toast.success("Draft generated!");
      navigate(
        `/projects/${data.project.id}/sections/${data.project.sections[0].id}`
      );
    },
    onError: () => {
      toast.error("Something went wrong, please try again.");
    },
  });

  const onSubmit = useCallback(
    (payload: z.infer<typeof formSchema>) => {
      saveProject.mutate(payload);
    },
    [saveProject.mutate]
  );

  useEffect(() => {
    if (saveProject.isPending) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [saveProject.isPending]);

  return (
    <>
      {saveProject.isPending ? (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="mt-2 text-lg font-semibold">
              Generating. Please wait...
            </p>
          </div>
        </div>
      ) : null}

      <div className="h-screen overflow-auto py-8 bg-slate-200">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="container mx-auto min-h-screen flex flex-col justify-center"
          >
            <div className="flex justify-end">
              <img src="/assets/logo.png" />
            </div>

            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="reportType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Report Type{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={reportTypes.length === 0}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Select a report type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {reportTypes.map((reportType, i) => {
                                return (
                                  <SelectItem
                                    key={i}
                                    value={reportType.apiName}
                                  >
                                    {reportType.displayName}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Customer <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={customers.length === 0}
                          >
                            <FormControl className="w-full">
                              <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {customers.map((customer, i) => {
                                return (
                                  <SelectItem key={i} value={customer.id}>
                                    {customer.name}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-12 gap-4 mt-6">
              <div className="col-span-6">
                <Card className="mx-auto">
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="projectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Project Name{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="projectNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Project Number{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Location <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-6">
                <Card className="mx-auto h-full">
                  <CardHeader>
                    <CardTitle>QA Inputs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="originator"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Originator{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Defaults to User ID"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reviewer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Reviewer <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="approver"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Approver <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-6">
              <Card className="mx-auto">
                <CardHeader>
                  <CardTitle>File Uploads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="meetingMinutes"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Meeting Minutes</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            multiple
                            onChange={(e) => {
                              onChange(e.target.files);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="threatRegister"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Threat Register</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            multiple
                            onChange={(e) => {
                              onChange(e.target.files);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="closeOutRegister"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Close Out Register</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            multiple
                            onChange={(e) => {
                              onChange(e.target.files);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="overviewMap"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Overview Map</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            multiple
                            onChange={(e) => {
                              onChange(e.target.files);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="landUseQuestionnaire"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Land Use Questionnaire (LUQ)</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            multiple
                            onChange={(e) => {
                              onChange(e.target.files);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billOfMaterial"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Bill of Material (BOM)</FormLabel>
                        <FormControl>
                          <Input
                            {...fieldProps}
                            type="file"
                            multiple
                            onChange={(e) => {
                              onChange(e.target.files);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={saveProject.isPending}>
                    {saveProject.isPending ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Generating Proposal
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default Page;
