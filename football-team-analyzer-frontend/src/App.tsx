import React, { useState } from 'react';
import { useEffect } from "react";
import axios from 'axios'
import { Bar, Line } from "react-chartjs-2";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import './styles/app.sass'

const apiBaseUrl = 'http://localhost:3000/api/football'

const App = () => {
  const [footballData, setFootballData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const backendData = await Promise.all([
        axios.get(apiBaseUrl + '/teams').then(r => r.data),
        axios.get(apiBaseUrl + '/goalsPtsRegressionCorrelation').then(r => r.data),
        axios.get(apiBaseUrl + '/getTopAndLeastPerformingTeams').then(r => r.data),
        axios.get(apiBaseUrl + '/getTopAndLeastScoringTeams').then(r => r.data),
      ]);
      
      setFootballData({
        topScoringTeams: getTeamsPerformance(backendData[3].topScoringTeams),
        leastScoringTeams: getTeamsPerformance(backendData[3].leastScoringTeams),
        topPerformerTeams: getTeamsPerformance(backendData[2].topPerformerTeams),
        leastPerformingTeams: getTeamsPerformance(backendData[2].leastPerformingTeams),
        goalsPtsRegression: getRegressionPoints(backendData[1]),
        goalsPtsCorrelation: backendData[1].correlation,
        teamsData: backendData[0]
      }); 
    })();
  }, []);

  const getTeamsPerformance = (teamsData) => {
    return {
      labels: teamsData.map((el) => el[0]),
      datasets: [
        {
          label: `Team Performance`,
          data: teamsData.map((el) => el[1]),
        },
      ],
    }
  };

  const getRegressionPoints = (regressionData) => {
    const { m, b } = regressionData.regresion;

    return {
      labels: [0, 1, 2, 3],
      datasets: [
        {
          label: `Pts/Goals`,
          data: [0, 1, 2, 3].map((x) => m * x + b),
        },
      ],
    }
  };

  const backupDb = () => {
    axios.post(apiBaseUrl + '/db/backup')
  }

  const restoreDb = () => {
    axios.post(apiBaseUrl + '/db/restore')
  }

  return (
    <>
      { footballData &&
        <div className="app">
          <div className="app-content">
            <div>
              <div className="table-subtitle">English premier league statistics</div>
              <Button className="backup-button" onClick={backupDb} variant="contained">Backup DB</Button>
              <Button variant="contained" onClick={restoreDb} color="primary">
                Restore DB
              </Button>
            </div>
              <div className="flexed-row">
                <TableContainer component={Paper}>
                  <Table aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Pts</TableCell>
                        <TableCell align="right">Wins</TableCell>
                        <TableCell align="right">Draws</TableCell>
                        <TableCell align="right">Loses</TableCell>
                        <TableCell align="right">Scored Goals</TableCell>
                        <TableCell align="right">Missed Goals</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {footballData.teamsData.map((row) => (
                        <TableRow key={row._id.teamId}>
                          <TableCell component="th" scope="row">
                            {row._id.teamId}
                          </TableCell>
                          <TableCell align="right">{row.pts}</TableCell>
                          <TableCell align="right">{row.wins}</TableCell>
                          <TableCell align="right">{row.draws}</TableCell>
                          <TableCell align="right">{row.loses}</TableCell>
                          <TableCell align="right">{row.scoredGoals}</TableCell>
                          <TableCell align="right">{row.misedGoals}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
              <div className="flexed-row">
                <div className="half-column">
                  <h3>Top teams by overperformance</h3>
                    <Bar
                      data={footballData.topPerformerTeams}
                    />
                </div>
                <div className="half-column">
                  <h3>Worst teams by overperformance</h3>
                    <Bar
                      data={footballData.leastPerformingTeams}
                    />
                </div>
              </div>
              <div className="flexed-row">
                <div className="half-column">
                  <h3>Top teams by scoring overperformance</h3>
                    <Bar data={footballData.topScoringTeams} />
                </div>
                <div className="half-column">
                  <h3>Worst teams by scoring overperformance</h3>
                    <Bar data={footballData.leastScoringTeams} />
                </div>
              </div>
              <div className="flexed-row">
                <div className="half-column">
                  <h3>Regression of point by goals</h3>
                    <Line
                      options={{
                        elements: {
                          point: {
                            radius: 0,
                          },
                        },
                      }}
                      data={footballData.goalsPtsRegression}
                    />
                    <p>Correlation of this relation is {footballData.goalsPtsCorrelation}</p>
                </div>
              </div>
          </div>
        </div>
      }
    </>
  )
};

export default App;
