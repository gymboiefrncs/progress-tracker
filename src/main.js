import "./style.css";

const params = new URLSearchParams(window.location.search);
const currentTopic = params.get("topic");

async function getRoadMap() {
  const savedData = localStorage.getItem("roadmapData");

  if (savedData) {
    console.log("Loaded roadmap from localStorage");
    const roadmap = JSON.parse(savedData);
    displayRoadMapData(roadmap[currentTopic]);
    return;
  }

  try {
    const response = await fetch("/roadmap.json");
    if (!response.ok) throw new Error("Failed to load JSON");
    const roadmap = await response.json();

    // Save fetched roadmap initially
    localStorage.setItem("roadmapData", JSON.stringify(roadmap));
    displayRoadMapData(roadmap[currentTopic]);
  } catch (err) {
    console.log(err);
  }
}

function displayRoadMapData(data) {
  const container = document.querySelector("#main-container");
  container.innerHTML = ""; // clear previous content

  if (data) {
    const roadmap = JSON.parse(localStorage.getItem("roadmapData"));
    const subTopicsData = Object.entries(data.subtopics);

    subTopicsData.forEach(([subtopic, value], index) => {
      // Determine if topic should be unlocked
      if (
        index === 0 ||
        (subTopicsData[index - 1] &&
          subTopicsData[index - 1][1].isFinished === true)
      ) {
        value.inProgress = true;
      } else {
        value.inProgress = false;
      }

      const subDiv = document.createElement("div");
      subDiv.classList.add(
        "card",
        "flex",
        "flex-col",
        "justify-between",
        "gap-3"
      );

      if (!value.inProgress && !value.isFinished) {
        const text = document.createElement("p");
        text.textContent = `Clear the previous topic first to unlock "${value.name}"`;
        text.classList.add("text-gray-500", "text-sm");
        subDiv.append(text);
        container.append(subDiv);
        return;
      }

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
        note.placeholder = "Where did you leave off?";
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

      // ✅ Toggle between "Mark as Done" and "Undo"
      const btn = document.createElement("button");
      btn.classList.add("btn");

      if (!value.isFinished) {
        btn.textContent = "Mark as Done";
        btn.classList.add("bg-blue-500", "text-white", "hover:bg-blue-600");
        btn.addEventListener("click", () => {
          value.isFinished = true;
          value.inProgress = false;
          value.note = value.note || "";

          roadmap[currentTopic].subtopics[subtopic] = value;

          if (subTopicsData[index + 1]) {
            subTopicsData[index + 1][1].inProgress = true;
          }

          localStorage.setItem("roadmapData", JSON.stringify(roadmap));
          displayRoadMapData(roadmap[currentTopic]);
        });
      } else {
        btn.textContent = "Undo";
        btn.classList.add("bg-gray-300", "hover:bg-gray-400");
        btn.addEventListener("click", () => {
          value.isFinished = false;
          value.inProgress = true;

          if (subTopicsData[index + 1]) {
            subTopicsData[index + 1][1].inProgress = false;
          }

          roadmap[currentTopic].subtopics[subtopic] = value;
          localStorage.setItem("roadmapData", JSON.stringify(roadmap));
          displayRoadMapData(roadmap[currentTopic]);
        });
      }

      subDiv.appendChild(btn);

      container.appendChild(subDiv);
    });
  }
}
console.log(localStorage);
getRoadMap();
