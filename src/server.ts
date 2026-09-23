import { Plugin } from "@opencode/plugin";
import { PLUGIN_ID } from "./constants.ts";
import { createScheduledPrompt, updateStore } from "./store.ts";
import { formatRunAt } from "./time.ts";

export default Plugin.define({
  id: PLUGIN_ID,
  async setup(ctx) {
    await ctx.tool.transform((editor) => {
      editor.add({
        name: "schedule_followup",
        description: "Schedule one non-recurring follow-up prompt in this same session. Use only when the user explicitly asks for future follow-up. Never call this tool from a scheduled follow-up unless the user sends a new request asking for another schedule.",
        input: {
          type: "object",
          properties: {
            delay_minutes: { type: "integer", minimum: 1, maximum: 10080 },
            prompt: { type: "string", minLength: 1, maxLength: 4000 },
          },
          required: ["delay_minutes", "prompt"],
          additionalProperties: false,
        },
        async execute(input, context) {
          const args = input as { delay_minutes: number; prompt: string };
          if (!args.prompt.trim()) throw new Error("Prompt cannot be empty");
          const runAt = Date.now() + args.delay_minutes * 60_000;
          const job = createScheduledPrompt({ prompt: args.prompt.trim(), runAt, sessionID: context.sessionID, source: "agent" });
          await updateStore((store) => {
            if (store.jobs.some((item) => item.status === "pending" && item.source === "agent" && item.sessionID === context.sessionID)) {
              throw new Error("This session already has a pending agent-scheduled follow-up");
            }
            return { ...store, jobs: [job, ...store.jobs] };
          });
          return {
            content: `One follow-up is scheduled for ${formatRunAt(runAt)} in this session. It will run only once and requires the OpenCode terminal client with this plugin to remain open.`,
            metadata: { title: "Follow-up scheduled" },
          };
        },
      });
    });
  },
});
