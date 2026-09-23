/** @jsxImportSource @opentui/solid */
import { Plugin } from "@opencode/plugin/tui";
import type { Context } from "@opencode/plugin/tui/context";
import { PLUGIN_ID, SCHEDULE_COMMAND_OPEN } from "./constants.ts";
import { startScheduler } from "./scheduler.ts";
import { saveDraftPrompt } from "./store.ts";
import { openManager, openScheduler } from "./tui/dialogs.tsx";
import { SidebarScheduledPrompts } from "./tui/SidebarScheduledPrompts.tsx";

function Commands(props: { api: Context }) {
  props.api.keymap.layer(() => ({
    mode: "global",
    commands: [{
      id: SCHEDULE_COMMAND_OPEN, title: "Schedule Prompt", group: "Plugin", palette: true,
      slash: { name: "schedule", arguments: true },
      run: async (input) => {
        if (input?.trim()) await saveDraftPrompt(input);
        await openScheduler(props.api);
      },
    }],
  }));
  return null;
}

export default Plugin.define({
  id: PLUGIN_ID,
  setup(api) {
    const commands = api.ui.slot({ append: "app", render: () => <Commands api={api} /> });
    const sidebar = api.ui.slot({ append: "sidebar.content", render: (props) => (
      <SidebarScheduledPrompts api={api} sessionID={props.sessionID} onOpenManager={() => void openManager(api)} />
    ) });
    const scheduler = startScheduler(api);
    return () => { scheduler(); sidebar(); commands(); };
  },
});
