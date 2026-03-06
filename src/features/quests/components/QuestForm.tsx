"use client";

import { createQuest } from "@/features/quests/actions/createQuest";
import {
  QUEST_TYPES,
  QUEST_PRIORITIES,
  QUEST_TYPE_LABELS,
  PRIORITY_LABELS,
} from "@/shared/lib/constants";
import { useRef } from "react";
import type { GuildOption } from "@/features/guilds/types";

export function QuestForm({
  onClose,
  guildOptions = [],
}: {
  onClose?: () => void;
  guildOptions?: GuildOption[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await createQuest(formData);
    formRef.current?.reset();
    onClose?.();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
      <input
        name="title"
        required
        placeholder="Quest title..."
        className="rpg-input"
      />

      <textarea
        name="description"
        placeholder="Description (optional)"
        rows={3}
        className="rpg-textarea"
      />

      <div className="grid grid-cols-2 gap-3">
        <SelectField name="questType" label="Type" options={QUEST_TYPES} labels={QUEST_TYPE_LABELS} />
        <SelectField name="priority" label="Priority" options={QUEST_PRIORITIES} labels={PRIORITY_LABELS} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="rpg-subhead">Board</label>
        <select name="guildId" className="rpg-select">
          <option value="">Personal Board</option>
          {guildOptions.map((guild) => (
            <option key={guild.id} value={guild.id}>
              Guild: {guild.name}
            </option>
          ))}
        </select>
      </div>

      <input
        name="dueDate"
        type="date"
        className="rpg-input"
      />

      <button
        type="submit"
        className="rpg-button px-4 py-2 text-sm"
      >
        Accept Quest ⚔️
      </button>
    </form>
  );
}

function SelectField<T extends string>({
  name,
  label,
  options,
  labels,
}: {
  name: string;
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="rpg-subhead">{label}</label>
      <select
        name={name}
        className="rpg-select"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labels[opt]}
          </option>
        ))}
      </select>
    </div>
  );
}
