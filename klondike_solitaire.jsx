// klondike_solitaire.jsx

class Card {
	constructor(suit, number, id=undefined) {
		if(id !== undefined) {
			let match = id.match(/([a-z]+)([0-9]+)/);
			this.suit = match[1];
			this.number = parseInt(match[2]);
		} else {
			this.suit = suit;
			this.number = number;
		}
	}
	
	color() {
		if(this.suit === "clubs" || this.suit == "spades")
			return "black";
		else if(this.suit == "diamonds" || this.suit == "hearts")
			return "red";
		return undefined;
	}
	
	image_src() {
		if(this.number > 1 && this.number < 11)
			return "images/deck/" + this.number + "_of_" + this.suit + ".png";
		else if(this.number === 11)
			return "images/deck/jack_of_" + this.suit + ".png";
		else if(this.number === 12)
			return "images/deck/queen_of_" + this.suit + ".png";
		else if(this.number === 13)
			return "images/deck/king_of_" + this.suit + ".png";
		else if(this.number === 1)
			return "images/deck/ace_of_" + this.suit + ".png";
		return undefined;
	}
	
	id() {
		return this.suit + this.number.toString();
	}
}

class Deck {
	constructor() {
		this.card_list = [];
		let suit_list = ["spades", "clubs", "diamonds", "hearts"];
		for(let i = 0; i < suit_list.length; i++) {
			for(let j = 1; j <= 13; j++) {
				this.card_list.push(new Card(suit_list[i], j));
			}
		}
	}
	
	shuffle() {
		for(let i = 0; i < this.card_list.length - 1; i++) {
			let j = Math.floor(Math.random() * (this.card_list.length - i)) + i;
			if(j !== i) {
				let tmp = this.card_list[i];
				this.card_list[i] = this.card_list[j];
				this.card_list[j] = tmp;
			}
		}
	}
}

class KlondikeSolitaire extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.generate_new_game_state();
	}
	
	generate_new_game_state() {
		let new_game_state = {
			"draw_pile": [],
			"choose_pile": [],
			"suit_piles": {
				"spades": [],
				"clubs": [],
				"hearts": [],
				"diamonds": []
			},
			"stacks": [
				[],
				[],
				[],
				[],
				[],
				[],
				[],
			],
			"hide_sizes": []
		};
		let deck = new Deck();
		deck.shuffle();
		for(let i = 0; i < 7; i++) {
			let stack = new_game_state.stacks[i];
			for(let j = 0; j < i + 1; j++ ) {
				let card = deck.card_list.pop(0);
				stack.push(card);
			}
			new_game_state.hide_sizes.push(i);
		}
		while(deck.card_list.length > 0) {
			let card = deck.card_list.pop(0);
			new_game_state.draw_pile.push(card);
		}
		return new_game_state;
	}
	
	render_draw_pile() {
	    if(this.state.draw_pile.length > 0)
            return <img src="images/deck/card_back.png" className="card"></img>;
        else
            return <img src="images/empty_stack.png" className="card"></img>;
	}
	
	render_choose_pile() {
	    if(this.state.choose_pile.length === 0)
            return <img src="images/empty_stack.png" className="card"></img>;
        else {
            let j = this.state.choose_pile.length - Math.min(3, this.state.choose_pile.length);
            return this.state.choose_pile.filter((card, i) => i >= j).map(card => {
                let style = {
                    top: "0px",
                    left: (i + 20).toString() + "px"
                };
                return <img src={card.image_src()} style={style} className="card"></img>;
            });
        }
	}
	
	render_suit_pile(suit) {
	    if(this.state.suit_piles[suit].length > 0) {
            let length = this.state.suit_piles[suit].length;
            let card = this.state.suit_piles[suit][length - 1];
            return <img src={card.image_src()} className="card"></img>;
        } else {
            return <img src="images/empty_stack.png" className="card"></img>;
        }
	}
	
	render_stack(i) {
	    let stack_list = this.state.stacks[i];
	    return stack_list.map((card, j) => {
            let style = {
                top: (j * 40).toString() + "px",
                left: "0px"
            };
            let image_file = j < this.state.hide_sizes[i] ? "images/deck/card_back.png" : card.image_src();
            return <img src={image_file} style={style} className="card"></img>;
        });
	}
	
	render() {
		
		let stack_div_list = [];		
		stack_div_list.push(<div className="stack_base">{this.render_draw_pile()}</div>);
		stack_div_list.push(<div className="stack_base">{this.render_choose_pile()}</div>);
		stack_div_list.push(<div className="stack_base"><img src="images/empty_stack.png" className="card"></img></div>);
		for(let suit in this.state.suit_piles)
			stack_div_list.push(<div className="stack_base">{this.render_suit_pile(suit)}</div>);
		let first_row_of_stacks_div = React.createElement('div', {className: "row_of_stacks"}, ...stack_div_list);
		
		stack_div_list = [];
		for(let i = 0; i < this.state.stacks.length; i++)
			stack_div_list.push(<div className="stack_base">{this.render_stack(i)}</div>);
		let second_row_of_stacks_div = React.createElement('div', {className: "row_of_stacks"}, ...stack_div_list);
		
		return React.createElement('div', null, first_row_of_stacks_div, second_row_of_stacks_div);
	}
}

var game = ReactDOM.render(<KlondikeSolitaire/>, document.getElementById("klondike_solitaire"));

var new_game_button_clicked = () => {
    // Note that setState is an asynchronous call!
    game.setState(game.generate_new_game_state());
}