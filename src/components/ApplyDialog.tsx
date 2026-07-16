import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  applicationSchema,
  submitApplication,
  type Application,
} from "@/lib/applications";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: { id: string; title: string; img: string };
  onSubmitted: (app: Application) => void;
};

type Errors = Partial<Record<keyof typeof initialForm, string>>;

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  moveInDate: "",
  occupation: "",
  message: "",
};

export function ApplyDialog({ open, onOpenChange, room, onSubmitted }: Props) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof typeof initialForm>(k: K, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof typeof initialForm;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    const app = submitApplication(room, parsed.data);
    setSubmitting(false);
    setForm(initialForm);
    onSubmitted(app);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Apply for {room.title}
          </DialogTitle>
          <DialogDescription>
            A short intro helps the landlord say yes. Takes about a minute.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field label="Full name" error={errors.fullName} htmlFor="fullName">
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              maxLength={100}
              autoComplete="name"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" error={errors.email} htmlFor="email">
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                maxLength={255}
                autoComplete="email"
              />
            </Field>
            <Field label="Phone" error={errors.phone} htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                maxLength={20}
                autoComplete="tel"
                placeholder="+27 82 000 0000"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Move-in date" error={errors.moveInDate} htmlFor="moveInDate">
              <Input
                id="moveInDate"
                type="date"
                value={form.moveInDate}
                onChange={(e) => set("moveInDate", e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </Field>
            <Field label="Occupation" error={errors.occupation} htmlFor="occupation">
              <Input
                id="occupation"
                value={form.occupation}
                onChange={(e) => set("occupation", e.target.value)}
                maxLength={80}
                placeholder="Designer, student, etc."
              />
            </Field>
          </div>

          <Field
            label="A short intro"
            error={errors.message}
            htmlFor="message"
            hint={`${form.message.length}/1000`}
          >
            <Textarea
              id="message"
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Tell the landlord a bit about you, your routine, and why this place feels right."
            />
          </Field>

          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send application"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={htmlFor} className="text-xs uppercase tracking-widest">
          {label}
        </Label>
        {hint && (
          <span className="font-mono text-[10px] text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
