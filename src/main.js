import "./style.css";

const params = new URLSearchParams(window.location.search);
const currentTopic = params.get("topic");

async function getRoadMap() {
  try {
    const response = await fetch("/roadmap.json");
    if (!response.ok) throw new Error("Failed to load JSON");
    const roadmap = await response.json();
    displayRoadMapData(roadmap[currentTopic]);
  } catch (err) {
    console.log(err);
  }
}

function displayRoadMapData(data) {
  const container = document.querySelector("#main-container");
  container.innerHTML = ""; // clear previous content

  if (data) {
    Object.entries(data.subtopics).forEach(([subtopic, value]) => {
      const subDiv = document.createElement("div");
      subDiv.classList.add(
        "card",
        "flex",
        "flex-col",
        "justify-between",
        "gap-3"
      );
      const header = document.createElement("div");
      header.classList.add("flex", "justify-between", "items-center");

      const name = document.createElement("h3");
      name.textContent = value.name;
      name.classList.add("text-xl", "font-bold", "text-gray-800", "truncate");

      const status = document.createElement("span");

      if (value.isFinished) {
        status.textContent = "Completed";
        status.classList.add("text-green-600", "bg-green-100");
      } else if (value.inProgress || (value.note && value.note.trim() !== "")) {
        status.textContent = "In Progress";
        status.classList.add("text-blue-600", "bg-blue-100");
      } else {
        status.textContent = "Not Started";
        status.classList.add("text-yellow-600", "bg-yellow-100");
      }

      status.classList.add(
        "text-sm",
        "font-semibold",
        "inline-block",
        "px-2",
        "py-1",
        "rounded-full"
      );

      header.append(name, status);
      subDiv.appendChild(header);

      if (!value.isFinished) {
        const note = document.createElement("textarea");
        note.placeholder = value.inProgress
          ? "Where did you leave off?"
          : "Type where you wanna start";
        note.value = value.note || "";
        note.classList.add(
          "mt-2",
          "p-2",
          "border",
          "border-gray-300",
          "rounded-md",
          "text-sm",
          "resize-none"
        );
        note.rows = 1;
        subDiv.append(note);
      }

      if (!value.isFinished) {
        const btn = document.createElement("button");
        btn.textContent = "Mark as Done";
        btn.classList.add("btn", "btn-primary");
        subDiv.appendChild(btn);
      } else {
        const description = document.createElement("p");
        description.textContent = "You're done here!";
        description.classList.add("mt-2", "text-gray-500", "text-sm");
        subDiv.appendChild(description);
      }

      container.appendChild(subDiv);
    });
  }
}

getRoadMap();
