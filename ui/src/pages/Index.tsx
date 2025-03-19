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
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

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
  sections: Record<string, string>;
};

const Page = () => {
  const form = useForm<z.infer<typeof formSchema>>({});
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: z.infer<typeof formSchema>) => {
      const res = await axios.post<GenerateProposalResponse>(
        `${import.meta.env.VITE_API_URL}/generate-proposal`,
        {
          report_type: "HDPE",
          customer_name: "Santos",
          project_name: payload.projectName,
          project_number: payload.projectNumber,
          location: payload.location,
          meeting_minutes: payload.meetingMinutes,
        }
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
    <main className="min-h-screen py-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card className="w-[350px] mx-auto">
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

          <Card className="w-[350px] mx-auto">
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

          <Card className="w-[350px] mx-auto">
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
                {isPending ? "Generating Proposal..." : "Submit"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </main>
  );
};

export default Page;
