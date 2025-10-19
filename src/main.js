import "./style.css";

const params = new URLSearchParams(window.location.search);
const currentTopic = params.get("topic");

async function getRoadMap() {
  const savedData = localStorage.getItem("roadmapData");

  if (savedData) {
    const roadmap = JSON.parse(savedData);
    displayRoadMapData(roadmap[currentTopic]);
    displayProgress(roadmap);
    return;
  }
  try {
    const response = await fetch("/roadmap.json");
    if (!response.ok) throw new Error("Failed to load JSON");
    const roadmap = await response.json();

    localStorage.setItem("roadmapData", JSON.stringify(roadmap));
    displayRoadMapData(roadmap[currentTopic]);
  } catch (err) {
    console.log(err);
  }
}

function displayRoadMapData(data) {
  const container = document.querySelector("#main-container");
  if (!container) return;
  container.innerHTML = "";
  if (data) {
    const roadmap = JSON.parse(localStorage.getItem("roadmapData"));
    const subTopicsData = Object.entries(data.subtopics);
    subTopicsData.forEach(([subtopic, value], index) => {
      // Determine if topic should be unlocked
      if (index === 0 || subTopicsData[index - 1][1].isFinished === true) {
        value.isStarted = true;
      } else {
        value.isStarted = false;
      }

      const subDiv = document.createElement("div");
      subDiv.classList.add(
        "card",
        "flex",
        "flex-col",
        "justify-between",
        "gap-3"
      );

      if (!value.isStarted && !value.isFinished) {
        const text = document.createElement("p");
        text.textContent = `Clear the previous topic first to unlock "${value.name}"`;
        text.classList.add("text-text", "text-sm");
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

      // note section
      if (!value.isFinished) {
        const body = document.createElement("div");
        body.classList.add("gap-2", "flex", "items-center");
        const saveBtn = document.createElement("button");
        saveBtn.classList.add("btn", "btn-success", "p-2", "text-sm");
        saveBtn.textContent = "Save";
        const note = document.createElement("textarea");
        note.placeholder = value.inProgress
          ? "Where did you leave off?"
          : "What topic do you wanna learn";
        note.value = value.note || "";
        note.classList.add(
          "p-2",
          "border",
          "border-gray-300",
          "rounded-md",
          "text-sm",
          "font-semibold",
          "resize-none",
          "w-full"
        );
        note.rows = 1;

        saveBtn.addEventListener("click", () => {
          value.note = note.value;
          value.inProgress = true;
          roadmap[currentTopic].subtopics[subtopic] = value;
          localStorage.setItem("roadmapData", JSON.stringify(roadmap));
          displayRoadMapData(roadmap[currentTopic]);
        });

        body.append(note, saveBtn);
        subDiv.append(body);
      }

      const btn = document.createElement("button");
      btn.classList.add("btn");

      if (!value.isFinished) {
        btn.textContent = "Mark as Done";
        btn.classList.add("bg-blue-500", "hover:bg-blue-600");
        btn.addEventListener("click", () => {
          value.isFinished = true;
          value.inProgress = false;
          value.note = value.note || "";

          roadmap[currentTopic].subtopics[subtopic] = value;

          if (subTopicsData[index + 1]) {
            subTopicsData[index + 1][1].isStarted = true;
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
            subTopicsData[index + 1][1].isStarted = false;
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

function displayProgress(data) {
  const toggleBtnContainer = document.querySelector("#toggle-btn-container");
  const container = document.querySelector("#progress-container");
  if (!container) return;
  container.innerHTML = "";

  Object.entries(data).forEach(([key, value]) => {
    const subDiv = document.createElement("div");
    subDiv.classList.add(
      "card",
      "p-4",
      "rounded-xl",
      "shadow-md",
      "flex",
      "flex-col",
      "gap-2",
      "bg-white"
    );

    const title = document.createElement("h2");
    title.textContent = value.name;
    title.classList.add("text-lg", "font-bold", "text-gray-800");

    const subTopics = Object.values(value.subtopics);
    const total = subTopics.length;
    const finished = subTopics.filter((topic) => topic.isFinished).length;
    const progress = total === 0 ? 0 : Math.round((finished / total) * 100);

    const progressText = document.createElement("p");
    progressText.textContent = `Progress: ${progress}%`;

    const progressContainer = document.createElement("div");
    progressContainer.classList.add(
      "w-full",
      "bg-gray-300",
      "h-3",
      "rounded-full"
    );

    const progressBar = document.createElement("div");
    progressBar.classList.add("h-3", "rounded-full", "bg-blue-500");
    progressBar.style.width = `${progress}%`;

    const finishedTopics = subTopics
      .filter((topic) => topic.isFinished)
      .map((topic) => topic.name)
      .sort((a, b) => a.localeCompare(b));

    if (finishedTopics.length > 0) {
      const dropDownContainer = document.createElement("div");
      dropDownContainer.classList.add("mt-2");

      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = `View finished topics (${finishedTopics.length})`;
      toggleBtn.classList.add("btn", "btn-primary");

      const listContainer = document.createElement("ul");
      listContainer.classList.add(
        "bg-bg",
        "py-2",
        "border-border",
        "rounded-sm",
        "indent-4",
        "hidden",
        "text-text",
        "hover:bg-gray-200",
        "transition-color",
        "duration-200",
        "truncate",
        "overflow-y-auto",
        "max-h-[20rem]",
        "scrollbar"
      );
      finishedTopics.forEach((item) => {
        const list = document.createElement("li");
        list.textContent = `- ${item} | ${value.name}`;
        list.classList.add("text-text", "mb-2");
        listContainer.append(list);
      });

      toggleBtn.addEventListener("click", () => {
        listContainer.classList.toggle("hidden");
      });

      dropDownContainer.append(toggleBtn, listContainer);
      toggleBtnContainer.append(dropDownContainer);
    }

    if (!value.startDate && subTopics[0].isStarted) {
      value.startDate = new Date().toISOString();
    }

    if (progress === 100 && !value.finishDate) {
      value.finishDate = new Date().toISOString();
    }

    let totalDays = 0;
    if (value.startDate) {
      const start = new Date(value.startDate);
      const end = value.finishDate ? new Date(value.finishDate) : new Date();
      totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    const daysText = document.createElement("p");
    daysText.textContent = `Total Days: ${totalDays}`;
    daysText.classList.add("text-sm", "text-gray-500");

    progressContainer.append(progressBar);
    subDiv.append(title, progressText, progressContainer, daysText);
    container.append(subDiv);
  });
}
getRoadMap();
