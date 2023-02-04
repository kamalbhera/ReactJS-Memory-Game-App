import React from "react";
import { History, LocationState } from "history";
import GameService from "../services/game.service";
import ErrorComponent from "../components/ErrorComponent";

interface IMemoryGameLayoutProps {
  history: History<LocationState>;
}

interface IMemoryGameLayoutState {
  cards: Array<any>;
  selectedCardKeyIndices: Array<number>;
  gameTimer: string;
  gameFinished: boolean;
}

class MemoryGameLayout extends React.Component<
  IMemoryGameLayoutProps,
  IMemoryGameLayoutState
> {
  private difficulty: string = "";
  private gameID: string = "";
  private solvedCards: Array<number> = [];
  private timerStartDate: Date;
  private cardsMatched: boolean = false;
  private moveErrors: number = 0;
  private gameService: GameService;
  public timerInterval: any;
  public errorMessage: string = "";
  public disabledClickOnCard: boolean = false;

  constructor(props: any) {
    super(props);

    this.state = {
      cards: [],
      selectedCardKeyIndices: [],
      gameTimer: "0m 0s",
      gameFinished: false,
      // solvedCards: [],
    };
    this.timerStartDate = new Date();
    this.gameService = new GameService();
  }

  componentDidMount(): void {
    if (
      this.props.history.location.search &&
      this.props.history.location.search !== ""
    ) {
      this.difficulty = this.props.history.location.search.replace(
        "?difficulty=",
        ""
      );
      this.gameService
        .getInitialGameLayout(this.difficulty)
        .then((res) => {
          this.gameID = res.id;
          this.setState({ cards: res.data });
        })
        .catch((error: Error) => {
          this.errorMessage = error.toString();
          console.log(error);
        });
    }
    this.initialiseGameTimer();
  }

  private initialiseGameTimer = (): void => {
    // timer
    this.timerInterval = setInterval(() => {
      let newDate = new Date();
      let diffInMilliseconds =
        newDate.getTime() - this.timerStartDate.getTime(); // milliseconds
      let minutes = Math.floor(diffInMilliseconds / 60000); // 1ms = 1/1000s = 1/60000m
      var seconds = ((diffInMilliseconds % 60000) / 1000).toFixed(0);
      this.setState({ gameTimer: `${minutes}m ${seconds}s` });
    }, 1000);
  };

  private checkIfCardsMatch = (): void => {
    if (this.state.gameFinished) {
      clearInterval(this.timerInterval);
    }

    if (this.state.selectedCardKeyIndices.length === 2) {
      if (this.cardsMatched === true) {
        this.solvedCards.push(this.state.selectedCardKeyIndices[0]);
        this.solvedCards.push(this.state.selectedCardKeyIndices[1]);
        this.setState({ selectedCardKeyIndices: [] });
      } else {
        // this.moveErrors += 1;
        this.disabledClickOnCard = true;
        setTimeout(() => {
          this.setState({ selectedCardKeyIndices: [] });
          this.disabledClickOnCard = false;
        }, 3000);
      }
    }
  };

  handleCardClick = (cardKey: string, cardIndex: number): void => {
    this.errorMessage = "";

    const selectedCardsIndices = [
      ...this.state.selectedCardKeyIndices,
      cardIndex,
    ];
    // initialise payload and make service call
    const payload = {
      selectedCardsIndices: selectedCardsIndices,
      solvedCardIndices: this.solvedCards,
      difficulty: this.difficulty,
      moveErrors: this.moveErrors,
    };
    this.gameService
      .getChangedGameLayout(this.gameID, payload)
      .then((res) => {
        console.log(res);
        this.cardsMatched = res.match;
        this.moveErrors = res.moveErrors;
        this.setState(
          {
            cards: res.data,
            selectedCardKeyIndices: res.selectedCardsIndices,
            gameFinished: res.gameFinished,
          },
          () => this.checkIfCardsMatch()
        );
      })
      .catch((error: Error) => {
        this.errorMessage = error.toString();
        console.log(error);
      });
  };

  render() {
    return (
      <React.Fragment>
        {this.errorMessage === "" ? null : (
          <ErrorComponent errorMessage={this.errorMessage} />
        )}
        {this.state.gameFinished === true ? (
          <React.Fragment>
            <h2>
              You have completed {this.difficulty} stage with {this.moveErrors}{" "}
              errors in {this.state.gameTimer} time.
            </h2>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <span>Match all cards in shortest time with fewer moves.</span>
            <div className="game-stats">
              <span>Elapsed Time: {this.state.gameTimer}</span>
              <span>Errors: {this.moveErrors}</span>
            </div>
            <div>
              {this.state.cards.map((card, cardIndex: number) => (
                <React.Fragment key={cardIndex}>
                  <button
                    style={{
                      visibility: this.solvedCards.includes(cardIndex)
                        ? "hidden"
                        : "visible",
                    }}
                    className={`flip-card${
                      this.state.selectedCardKeyIndices.includes(cardIndex)
                        ? " face-up"
                        : ""
                    }`}
                    type="button"
                    key={cardIndex}
                    disabled={
                      this.state.selectedCardKeyIndices.includes(cardIndex) ||
                      this.solvedCards.includes(cardIndex) ||
                      this.disabledClickOnCard
                    }
                    onClick={(cardClickEvent) =>
                      this.handleCardClick(card.key, cardIndex)
                    }
                  >
                    {this.state.selectedCardKeyIndices.includes(cardIndex) ||
                    this.solvedCards.includes(cardIndex)
                      ? card.value
                      : "FLIP"}
                  </button>
                  {(window.screen.width < 600 && (cardIndex + 1) % 5 === 0) ||
                  (cardIndex + 1) % 10 === 0 ? (
                    <br />
                  ) : null}
                </React.Fragment>
              ))}
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

export default MemoryGameLayout;
