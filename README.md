# OpenCode Scheduled

Schedule one-time prompts in OpenCode with `/schedule` and see upcoming prompts in the sidebar.

## Install

```sh
opencode plugin add opencode-scheduled
```

## Usage

Run `/schedule` or select **Schedule Prompt** in the command palette.
Include a time and prompt to schedule directly:

```text
/schedule in 30m Check the build results
/schedule at 3:30am Summarize the overnight logs
/schedule today 14:00 Review the deployment
/schedule tomorrow 9am Check open issues
```

Use `/schedule <prompt>` to enter the time separately. Times use your local time
zone. Recurring schedules are not supported.

## Controls

- `a`: add a prompt.
- Up / Down: select a pending prompt.
- `Enter`, `Ctrl+D`, or click: open cancellation confirmation.
- `p`: pause or resume all schedules in the shared store.
- `Esc`: close the manager.

The manager lists pending prompts across sessions. The sidebar shows the next
six prompts for the current session.

## Agent follow-ups

Ask an agent to schedule a follow-up with `schedule_followup`:

```json
{
  "delay_minutes": 30,
  "prompt": "Check the build results and summarize any failures."
}
```

Delays range from one minute to seven days, with one pending agent-created
follow-up per session.

## Delivery notes

- Keep an OpenCode terminal running for delivery. Pending prompts survive restarts;
  overdue prompts are attempted when the terminal reopens.
- Prompts return to their original session and queue without interrupting a response.
- Use one scheduler terminal per store to avoid duplicate delivery.
- Failed prompts are not retried automatically.
- Schedules store prompt text locally. Avoid including secrets.
