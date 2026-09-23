/** @jsxImportSource @opentui/solid */
import type { Context as TuiPluginApi } from "@opencode/plugin/tui/context";
import { formatRunAt, parseScheduleRequest, parseTimeSpec } from "../time.ts";
import { takeDraftPrompt } from "../store.ts";
import type { ScheduledPrompt } from "../types.ts";
import { taskID } from "../format.ts";
import { addScheduledPrompt, cancelScheduledPrompt, loadSchedulerState, toggleSchedulerPause } from "../scheduler.ts";
import { SchedulerManagerDialog } from "./SchedulerManagerDialog.tsx";

async function openTimePrompt(api: TuiPluginApi, prompt: string): Promise<void> {
  const value = await api.ui.dialog.prompt({ title: "Schedule Prompt", placeholder: "in 30m, at 3:30am, today 14:00, tomorrow 9am", description: "Prompt captured. Choose when it should send." });
  if (value === undefined) return openManager(api);
  const runAt = parseTimeSpec(value);
  if (!runAt) {
    api.ui.toast.show({ message: "Could not understand that time", variant: "error", duration: 3000 });
    return openTimePrompt(api, prompt);
  }
  await addScheduledPrompt(api, prompt, runAt);
  await openManager(api);
}

async function openPromptInput(api: TuiPluginApi, value = ""): Promise<void> {
  const prompt = await api.ui.dialog.prompt({ title: "Schedule Prompt", value, placeholder: "Prompt to send later" });
  if (prompt === undefined) return openManager(api);
  const parsed = parseScheduleRequest(prompt);
  if (!parsed.prompt) {
    api.ui.toast.show({ message: "Prompt cannot be empty", variant: "error", duration: 2500 });
    return openPromptInput(api, prompt);
  }
  if (!parsed.runAt) return openTimePrompt(api, parsed.prompt);
  await addScheduledPrompt(api, parsed.prompt, parsed.runAt);
  await openManager(api);
}

async function confirmCancel(api: TuiPluginApi, job: ScheduledPrompt): Promise<void> {
  if (await api.ui.dialog.confirm({ title: "Cancel Prompt", message: `${taskID(job)} at ${formatRunAt(job.runAt)}` })) {
    await cancelScheduledPrompt(api, job);
  }
  await openManager(api);
}

export async function openManager(api: TuiPluginApi): Promise<void> {
  const state = await loadSchedulerState();
  api.ui.dialog.show(() => (
    <SchedulerManagerDialog api={api} initialJobs={state.jobs} initialPaused={state.paused} loadJobs={loadSchedulerState}
      onAdd={() => void openPromptInput(api)} onCancel={(job) => void confirmCancel(api, job)}
      onTogglePause={() => toggleSchedulerPause(api)} />
  ));
}

export async function openScheduler(api: TuiPluginApi): Promise<void> {
  const draft = await takeDraftPrompt();
  if (draft) {
    const parsed = parseScheduleRequest(draft);
    if (parsed.prompt && parsed.runAt) {
      await addScheduledPrompt(api, parsed.prompt, parsed.runAt);
      return openManager(api);
    }
    return openPromptInput(api, parsed.prompt || draft);
  }
  await openManager(api);
}
