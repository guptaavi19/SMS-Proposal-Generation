import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { http } from "@/lib/utils";
import { Customer, Project, ReportType } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  billOfMaterials: z.any(),
});

type SaveProjectResponse = {
  message: string;
  data: {
    project: Project;
  };
};

const Page = () => {
  const form = useForm<z.infer<typeof formSchema>>({});
  const navigate = useNavigate();

  const reportTypeQuery = useQuery({
    queryKey: ["report_types"],
    queryFn: async () => {
      const res = await http.get<{ data: { reportTypes: ReportType[] } }>(
        "/report-types"
      );

      return res.data;
    },
  });

  const customerQuery = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await http.get<{ data: { customers: Customer[] } }>(
        "/customers"
      );

      return res.data;
    },
  });

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
      formData.append("meeting_minutes", payload.meetingMinutes);
      formData.append("threat_register", payload.threatRegister);
      formData.append("close_out_register", payload.closeOutRegister);
      formData.append("land_use_questionnaire", payload.landUseQuestionnaire);
      formData.append("bill_of_materials", payload.billOfMaterials);

      const res = await http.post<SaveProjectResponse>("/projects", formData);

      return res.data;
    },
    onSuccess: ({ data }) => {
      toast.success("Proposal generated! Redirecting...");
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

  if (reportTypeQuery.error) {
    toast.error("Error fetching report types.");
  }

  if (customerQuery.error) {
    toast.error("Error fetching customers.");
  }

  return (
    <main className="h-screen overflow-auto py-8 bg-slate-200">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="container mx-auto min-h-screen flex flex-col justify-center"
        >
          <div className="flex justify-end">
            <img src="/assets/logo.png" />
          </div>

          <Card className="mt-6">
            <CardContent>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="reportType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!customerQuery.data}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger>
                              <SelectValue placeholder="Select a report type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {reportTypeQuery.data &&
                            reportTypeQuery.data.data.reportTypes ? (
                              reportTypeQuery.data.data.reportTypes.map(
                                (reportType, i) => {
                                  return (
                                    <SelectItem
                                      key={i}
                                      value={reportType.apiName}
                                    >
                                      {reportType.displayName}
                                    </SelectItem>
                                  );
                                }
                              )
                            ) : (
                              <></>
                            )}
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
                        <FormLabel>Customer</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!customerQuery.data}
                        >
                          <FormControl className="w-full">
                            <SelectTrigger>
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customerQuery.data &&
                            customerQuery.data.data.customers ? (
                              customerQuery.data.data.customers.map(
                                (customer, i) => {
                                  return (
                                    <SelectItem key={i} value={customer.id}>
                                      {customer.name}
                                    </SelectItem>
                                  );
                                }
                              )
                            ) : (
                              <></>
                            )}
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
                        <FormLabel>Project Name</FormLabel>
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
                        <FormLabel>Project Number</FormLabel>
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
                        <FormLabel>Location</FormLabel>
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
                        <FormLabel>Originator</FormLabel>
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
                        <FormLabel>Reviewer</FormLabel>
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
                        <FormLabel>Approver</FormLabel>
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
                          onChange={(e) => {
                            onChange(e.target.files && e.target.files[0]);
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
                          onChange={(e) => {
                            onChange(e.target.files && e.target.files[0]);
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
                          onChange={(e) => {
                            onChange(e.target.files && e.target.files[0]);
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
                          onChange={(e) => {
                            onChange(e.target.files && e.target.files[0]);
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
                      <FormLabel>Land Use Questionnaire(LUQ)</FormLabel>
                      <FormControl>
                        <Input
                          {...fieldProps}
                          type="file"
                          onChange={(e) => {
                            onChange(e.target.files && e.target.files[0]);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billOfMaterials"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Bill of Materials(BOM)</FormLabel>
                      <FormControl>
                        <Input
                          {...fieldProps}
                          type="file"
                          onChange={(e) => {
                            onChange(e.target.files && e.target.files[0]);
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
    </main>
  );
};

export default Page;
