import React, { useState, useEffect } from "react";
import "./App.css";

const localStorageKey = "query";

function App() {
	const [query, setQuery] = useState(
		localStorage.getItem(localStorageKey) || ""
	);

	useEffect(() => {
		localStorage.setItem(localStorageKey, query);
	}, [query]);

	const whereMatch = query.match(/\n\nwhere (.*?)\n\ngroup/ims);
	const whereSection = whereMatch[1];
	const whereSectionWithoutComments = whereSection.replace(/--(.*?)\n/gi, "");

	const variableRegex = /@(.*?)( |\n)/;

	const variablesArray = whereSectionWithoutComments
		.match(new RegExp(variableRegex, "g"))
		.map(rawMatch => rawMatch.match(new RegExp(variableRegex))[1]);
	const variables = new Set(variablesArray);

	const whereSectionWithVariablesReplaced = whereSectionWithoutComments.replace(
		new RegExp(variableRegex, "g"),
		match => `:${match.substring(1)}`
	);

	const whereConditions = whereSectionWithVariablesReplaced.split(/\n\nand /);

	const javaCodeForVariables = Array.from(variables)
		.map(variable => `query.setParameter("${variable}", );\n`)
		.join("");

	const javaCodeForWhereConditions = whereConditions
		.map(
			condition =>
				`conditions.add("${condition
					.split("\n")
					.join(' \\n" + \n"')
					.replace(/"(\t{1,})/g, match => `${match.substring(1)}"`)}");\n`
		)
		.join("");

	const javaCode = `
List<String> conditions = new ArrayList<>();

${javaCodeForWhereConditions}

String whereClause = "where " + conditions.stream().collect(Collectors.joining(" and "));

${javaCodeForVariables}
	`;

	return (
		<div className="App">
			<div style={{ display: "flex", height: "800px" }}>
				<div style={{ flexGrow: 1 }}>
					<textarea
						value={query}
						onChange={evt => setQuery(evt.currentTarget.value)}
						style={{ width: "100%", height: "100%" }}
					></textarea>
				</div>
				<div style={{ flexGrow: 1 }}>
					<textarea
						defaultValue={javaCode}
						style={{ width: "100%", height: "100%" }}
					></textarea>
				</div>
			</div>
		</div>
	);
}

export default App;
