function showQuestions(questions) {
	console.log(questions);

	const container = document.getElementById("questions");
	container.className = "questions";

	// Questions
	questions.forEach(({ title, choices }) => {
		const questionContainer = document.createElement("div");
		questionContainer.className = "question";

		// Title
		const questionTitle = document.createElement("h2");
		questionTitle.className = "question-title";
		title.split("\n").forEach((titlePart) => {
			const line = document.createElement("p");
			line.textContent = titlePart;

			questionTitle.appendChild(line);
		});
		questionContainer.appendChild(questionTitle);

		// Choices
		const questionChoicesContainer = document.createElement("ol");
		questionChoicesContainer.className = "question-choices";
		choices.forEach(({ choice, isCorrect }) => {
			const questionChoice = document.createElement("li");
			questionChoice.className = "question-choice";
			questionChoice.setAttribute("data-correct", isCorrect);
			questionChoice.textContent = choice;

			// Icon
			const questionChoiceIcon = document.createElement("i");
			questionChoiceIcon.className = isCorrect ? "fa-solid fa-check" : "fa-solid fa-xmark";
			questionChoice.appendChild(questionChoiceIcon);

			questionChoicesContainer.appendChild(questionChoice);
		});
		questionContainer.appendChild(questionChoicesContainer);

		container.appendChild(questionContainer);
	});

	try {
		// Render katex expressions
		renderMathInElement(container, {
			delimiters: [
				{ left: "$$", right: "$$", display: true },
				{ left: "$", right: "$", display: true },
				{ left: "\\(", right: "\\)", display: false },
				{ left: "\\[", right: "\\]", display: true },
				{ left: "`", right: "`", display: true },
			],
			throwOnError: false
		});
	} catch (error) {
		console.error(error);
	}
}

async function fetchQuestionnaire() {
	const slug = location.pathname.split("/")[1];
	const token = localStorage.getItem("token");

	const url = `https://app.wooclap.com/api/events/${slug.toUpperCase()}?isParticipant=true&from=`;

	const result = await fetch(url, {
		headers: {
			authorization: `bearer ${token}`
		}
	}).then((response) => response.json()).catch((error) => {
		console.error(error);
		return null;
	});

	const questionnaire = result?.questionnaires[0];
	const questions = questionnaire?.questions;

	return questions;
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Get the current tab
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];

        // Execute script in the current tab
        const scriptOutput = await browser.scripting.executeScript({
			target: { tabId: tab.id },
			func: fetchQuestionnaire
		});

		const questions = scriptOutput[0].result;
		showQuestions(questions);
    } 
    catch(error) {
		console.error(error);
    }
});