import Axios from "axios";

class GameService {
  private initialGameLayoutURL = "http://localhost:5000/api/game/initialize";
  private changedGameLayoutURL = "http://localhost:5000/api/game/fetchstate";

  public getInitialGameLayout(difficultyValue: string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      Axios({
        method: "GET",
        url: this.initialGameLayoutURL,
        params: {
          difficulty: difficultyValue,
        },
      })
        .then((response) => {
          if (response && response.data) {
            resolve(response.data);
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  public getChangedGameLayout(
    gameIDValue: string,
    payloadValue: any
  ): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      Axios({
        method: "POST",
        url: this.changedGameLayoutURL + `/${gameIDValue}`,
        data: payloadValue,
      })
        .then((response) => {
          if (response && response.data) {
            resolve(response.data);
          }
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }
}

export default GameService;
