import { createPost } from "../actions";

const input =
  "w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm dark:border-gray-700";
const label = "text-sm font-medium text-gray-600 dark:text-gray-400";

export default function NewPostPage() {
  return (
    <main>
      <h1 className="mb-6 text-xl font-bold">Post a need</h1>

      <form action={createPost} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={label}>Type</label>
            <select name="type" defaultValue="hackathon" className={input}>
              <option value="hackathon">Hackathon</option>
              <option value="project">Project</option>
              <option value="study">Study</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={label}>Team size</label>
            <input name="teamSize" type="number" min={2} max={20} defaultValue={4} className={input} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>Title</label>
          <input
            name="title"
            required
            placeholder="Need 1 backend + 1 designer for HackNU this weekend"
            className={input}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>Description</label>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="What you're building, what's covered, what you need."
            className={input}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>Skills needed (comma-separated)</label>
          <input name="neededSkills" placeholder="node, postgres, figma" className={input} />
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>When (optional)</label>
          <input name="happeningAt" type="date" className={input} />
        </div>

        <button
          type="submit"
          className="self-start rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black"
        >
          Post it
        </button>
      </form>
    </main>
  );
}
