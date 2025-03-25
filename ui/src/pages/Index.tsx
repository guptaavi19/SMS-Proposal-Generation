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
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { v4 } from "uuid";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
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
});

type GenerateProposalResponse = {
  proposal_id: string;
  section_name: Record<string, string>;
  original_content: string;
  updated_content: string;
};

const Page = () => {
  const form = useForm<z.infer<typeof formSchema>>({});
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: z.infer<typeof formSchema>) => {
      const formData = new FormData();
      formData.append("proposal_id", v4());
      formData.append("report_type", "HDPE");
      formData.append("customer_name", "Santos");
      formData.append("project_name", payload.projectName);
      formData.append("project_number", payload.projectNumber);
      formData.append("location", payload.location);
      formData.append("meeting_minutes", payload.meetingMinutes);
      formData.append("section_name", "Executive Summary");

      const res = await axios.post<GenerateProposalResponse>(
        `${import.meta.env.VITE_API_URL}/generate-section`,
        formData
      );

      return res.data;
    },
    onSuccess: ({ proposal_id }) => {
      toast.success("Proposal generated! Redirecting...");
      navigate(`/proposals/${proposal_id}?section=0`);
    },
    onError: () => {
      toast.error("Something went wrong, please try again.");
    },
  });

  const onSubmit = useCallback(
    (payload: z.infer<typeof formSchema>) => {
      mutate(payload);
    },
    [mutate]
  );

  return (
    <main className="h-screen overflow-auto py-8 bg-slate-200">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="container mx-auto min-h-screen flex flex-col justify-center"
        >
          <div className="grid grid-cols-12 gap-4">
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
              <Card className="mx-auto">
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
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
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
