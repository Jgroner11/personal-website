const form = document.querySelector("[data-tutoring-form]");
const status = document.querySelector("[data-tutoring-status]");
const targetFrame = document.querySelector("[data-tutoring-target]");

let submitted = false;

form?.addEventListener("submit", () => {
  submitted = true;
  status.textContent = "";
});

targetFrame?.addEventListener("load", () => {
  if (!submitted) {
    return;
  }

  submitted = false;
  status.textContent = "Thanks! Your request has been sent — I'll be in touch soon.";
  form.reset();
});
