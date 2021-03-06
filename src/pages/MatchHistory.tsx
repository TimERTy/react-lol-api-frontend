import React, { Suspense } from "react";

import Loading from "../components/Loading";
import MatchView, { IMatchViewProps } from "../components/MatchView";
import logo from "../logo.svg";
import "./MatchHistory.css";
import { API_URL } from "../Constants";

interface MatchHistoryState {
	title: string;
	text: string;
	summonerName: string;
	accountId: string;
	matches: any[];
	matchCollection: IMatchViewProps[];
	showMatches: number;
	numMatches: number;
	champNum?: string;
}

class MatchHistory extends React.Component<Readonly<{ }>, MatchHistoryState> {
	constructor ( props: Readonly<{ }> ) {
		super( props );
		this.state = {
			title: "My API Parser (LoL)",
			text: "Summoner Name",
			summonerName: "",
			accountId: "",
			matches: [],
			matchCollection: [],
			showMatches: 0,
			numMatches: 10,
		};
	}

	async getAccountId () {
		// Gets the api based off of the summoner name provided
		await fetch( API_URL + "/api/accountId/" + this.state.summonerName )
			.then( res => res.json() )
			.then( data => {
				console.log( data );
				this.setState( { accountId: data.accountId, summonerName: data.name }, () => this.getMatchHistory() );
			} );
	}

	async getMatchHistory () {
		// this function will
		await fetch( API_URL + "/api/matchHistory/" + this.state.accountId )
			.then( res => res.json() )
			.then( data => this.setState( { matches: data, champNum: data[ 0 ].champion }, () => this.getMatches() ) );
	}

	async getMatch ( matchId: string ) {
		// this function will
		await fetch( API_URL + "/api/match/" + matchId )
			.then( res => res.json() )
			.then( ( data ) => {
				let team = -1;
				let participantId = -1;
				for ( let identity = 0 ; identity < 10 ; identity++ ) {
					console.log( data.participantIdentities[ identity ].player.summonerName, this.state.summonerName );
					if ( data.participantIdentities[ identity ].player.summonerName === this.state.summonerName ) {
						team = Math.floor( ( data.participantIdentities[ identity ].participantId - 1 ) / 5 );
						participantId = data.participantIdentities[ identity ].participantId;
					}
				}
				// console.log("deaths: ", data.participants[participantId]["stats"]["deaths"]);
				if ( team === -1 ) console.log( "The team has not been found." );
				this.setState( {
					// @ts-ignore
					matchCollection: [
						...this.state.matchCollection,
						{
							queueId: data.queueId,
							win: data.teams[ team ].win,
							champion: data.participants[ participantId - 1 ][ "championId" ],
							championName: "",
							kills: data.participants[ participantId - 1 ][ "stats" ][ "kills" ],
							deaths: data.participants[ participantId - 1 ][ "stats" ][ "deaths" ],
							assists: data.participants[ participantId - 1 ][ "stats" ][ "assists" ],
							level: data.participants[ participantId - 1 ][ "stats" ][ "champLevel" ],
							cs: data.participants[ participantId - 1 ][ "stats" ][ "totalMinionsKilled" ],
							multikill: data.participants[ participantId - 1 ][ "stats" ][ "largestMultiKill" ],
							timestamp: data.gameCreation,
						},
					],
				} );
			} );
	}

	getMatches () {
		this.setState( { matchCollection: [] }, () => {
			for ( let index = 0 ; index < this.state.numMatches ; index++ ) {
				this.getMatch( this.state.matches[ index ].gameId );
			}
		} );
	}

	async getChampName ( champNum: string ) {
		// this function will
		await fetch( API_URL + "/api/champName/" + champNum )
			.then( res => res.json() )
			.then( data => {
				return data.champions;
			} );
	}

	render () {
		return (
			<div className="MatchHistory">
				{ !this.state.showMatches ? <img src={ logo } className="MatchHistory-logo" alt="logo" /> : "" }
				<h1>{ this.state.title }</h1>
				<input
					className="MatchHistory-input"
					type="text"
					id="text"
					value={ this.state.text }
					onChange={ ( e: React.FormEvent<HTMLInputElement> ) => {
						const regex = new RegExp( "^[0-9a-zA-Z _.]+$" );
						if ( regex.test( e.currentTarget.value ) ) {
							// League of Legends Api
							//  This function uses lol dev api to figure out the last played champion played by the user
							//  The User will input thier IGN (in game name) which will then trigger an api search
							this.setState( {
								text: e.currentTarget.value,
							} );
						} else {
							console.log( "bad" );
						}
					} }
					onKeyDown={ e => {
						if ( e.key === "Enter" ) {
							this.setState(
								{
									summonerName: this.state.text,
									matchCollection: [],
									matches: [],
								},
								() => this.getAccountId()
							);
							if ( !this.state.showMatches ) this.setState( { showMatches: 1 } );
						}
					} }
				/>
				<span className="MatchHistory-matches-above-span" />
				{ !this.state.showMatches ? (
					<div className="MatchHistory-details">
						<p>{ this.state.accountId ? this.state.accountId : "No Account ID" }</p>
						<p>{ this.state.summonerName ? this.state.summonerName : "No Summoner Name" }</p>
						<p>{ this.state.matches[ 0 ] ? this.state.matches[ 0 ].champion : "No Matches" }</p>
					</div>
				) : (
					<div className="MatchHistory-matches">
						{ /* display matches */ }
						{ this.state.matchCollection.length >= this.state.numMatches ? "" : <Loading /> }
						{ this.state.matchCollection
							.sort( ( a: IMatchViewProps, b: IMatchViewProps ) => {
								if ( a.timestamp && b.timestamp )
									return b.timestamp - a.timestamp;
								return 0;
							} )
							.map( ( match ) => {
								return (
									<Suspense fallback={ <div>Loading...</div> }>
										<MatchView
											{ ...match }
											championIcon="Temp"
										/>
									</Suspense>
								);
							} ) }
					</div>
				) }
			</div>
		);
	}
}

export default MatchHistory;
