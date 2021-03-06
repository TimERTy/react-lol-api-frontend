import React, { useState } from "react";
import "./MatchView.css";
import { API_URL } from "../Constants";

export interface IMatchViewProps {
	queueId?: string;
	champion: string;
	kills: number;
	deaths: number;
	assists: number;
	level: number;
	cs: number;
	championIcon: any;
	championName?: string;
	win?: "Win";
	multikill?: any;
	timestamp?: number;
}

const MatchView: React.FC<IMatchViewProps> = ( { champion, kills, deaths, assists, level, cs, championIcon, win } ) => {
	const [ champName, setChampName ] = useState( "" );

	fetch( API_URL + "/api/champName/" + champion )
		.then( res => res.json() )
		.then( data => {
			setChampName( data.champName );
		} );

	return (
		<span className="MatchView-span">
			{ /*@ts-ignore*/ }
			<div className="MatchView" win={ win }>
				<span className="MatchView-win">{ win === "Win" ? "Win" : "Loss" }</span>
				<span className="MatchView-championIcon">{ championIcon }</span>
				<span className="MatchView-champion">{ champName }</span>
				<div className="MatchView-KDA">
					<span className="MatchView-KDA-kda">
						(K + A) / D: { Math.round( ( ( kills + assists ) / deaths ) * 100 ) / 100 }
					</span>
					<span className="MatchView-KDA-kills">K: { kills }</span>
					<span className="MatchView-KDA-deaths">D: { deaths }</span>
					<span className="MatchView-KDA-assists">A: { assists }</span>
				</div>
				<div className="MatchView-stats">
					<span className="MatchView-stats-level">Level: { level }</span>
					<span className="MatchView-stats-cs">CS: { cs }</span>
				</div>
			</div>
		</span>
	);
};

export default MatchView;
