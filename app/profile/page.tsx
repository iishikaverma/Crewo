import { currentUser } from "@/lib/user";
import { updateProfile } from "./actions";

const input =
  "w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm dark:border-gray-700";
const label = "text-sm font-medium text-gray-600 dark:text-gray-400";

export default async function ProfilePage() {
  const me = await currentUser();
  if (!me) return null;

  return (
    <main>
      <h1 className="mb-1 text-xl font-bold">Your profile</h1>
      <p className="mb-6 text-sm text-gray-500">
        Skills and &ldquo;looking for&rdquo; power your match score and what others see.
      </p>

      <form action={updateProfile} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className={label}>Name</label>
          <input name="name" defaultValue={me.name ?? ""} className={input} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={label}>Year</label>
            <input name="year" defaultValue={me.year ?? ""} placeholder="3" className={input} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={label}>Branch / campus</label>
            <input name="branch" defaultValue={me.branch ?? ""} placeholder="CSE" className={input} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>Skills (comma-separated)</label>
          <input
            name="skills"
            defaultValue={me.skills.join(", ")}
            placeholder="react, node, figma"
            className={input}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>Looking for</label>
          <input
            name="lookingFor"
            defaultValue={me.lookingFor ?? ""}
            placeholder="backend + designer for a weekend hack"
            className={input}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>Bio</label>
          <textarea name="bio" defaultValue={me.bio ?? ""} rows={3} className={input} />
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>Avatar image URL</label>
          <input name="image" defaultValue={me.image ?? ""} className={input} />
        </div>

        <fieldset className="flex flex-col gap-4 rounded-md border border-dashed border-gray-300 p-4 dark:border-gray-700">
          <legend className="px-1 text-xs text-gray-500">
            Contact — revealed only after a request is accepted
          </legend>
          <div className="flex flex-col gap-1">
            <label className={label}>GitHub URL</label>
            <input name="githubUrl" defaultValue={me.githubUrl ?? ""} className={input} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={label}>LinkedIn URL</label>
            <input name="linkedinUrl" defaultValue={me.linkedinUrl ?? ""} className={input} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={label}>WhatsApp number</label>
            <input name="whatsapp" defaultValue={me.whatsapp ?? ""} placeholder="+91..." className={input} />
          </div>
        </fieldset>

        <button
          type="submit"
          className="self-start rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black"
        >
          Save profile
        </button>
      </form>
    </main>
  );
}
