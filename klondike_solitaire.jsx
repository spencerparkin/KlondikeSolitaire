// klondike_solitaire.jsx

class Card {
	constructor(suit, number) {
        this.suit = suit;
        this.number = number;
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
		this.drag_data = null;
		this.state_history = [];
		this.state_future = [];
		this.update_undo_redo_buttons();
	}

    new_game() {
        let new_state = game.generate_new_game_state();
        this.setState(new_state);
        this.state_history = [];
        this.state_future = [];
        this.update_undo_redo_buttons();
    }

    update_undo_redo_buttons() {
        let undo_button = document.getElementById("undo_button");
        let redo_button = document.getElementById("redo_button");
        undo_button.disabled = (this.state_history.length == 0) ? true : false;
        redo_button.disabled = (this.state_future.length == 0) ? true : false;
    }

    undo() {
        if(this.state_history.length > 0) {
            let old_state = jQuery.extend(true, {}, this.state);
            this.state_future.unshift(old_state);
            let new_state = this.state_history.pop();
            super.setState(new_state);
            this.update_undo_redo_buttons();
        }
    }

    redo() {
        if(this.state_future.length > 0) {
            let old_state = jQuery.extend(true, {}, this.state);
            this.state_history.push(old_state);
            let new_state = this.state_future.shift();
            super.setState(new_state);
            this.update_undo_redo_buttons();
        }
    }

	setState(new_state) {
	    let old_state = jQuery.extend(true, {}, this.state);
	    this.state_history.push(old_state)
	    this.state_future = [];
	    this.update_undo_redo_buttons();
	    super.setState(new_state);
	}

	generate_new_game_state() {
		let new_game_state = {
			"draw_pile": [],
			"choose_pile": [],
			"suit_piles": [
				[],
				[],
				[],
				[]
			],
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

	game_won() {
	    for(let i = 0; i < this.state.suit_piles.length; i++)
	        if(this.state.suit_piles[i].length < 13)
	            return false;
	    return true;
	}

    draw_pile_click() {
        if(this.state.draw_pile.length > 0 || this.state.choose_pile.length > 0) {
            let new_state = jQuery.extend(true, {}, this.state);
            if(new_state.draw_pile.length > 0) {
                for(let i = 0; i < 3 && new_state.draw_pile.length > 0; i++) {
                    let card = new_state.draw_pile.pop();
                    new_state.choose_pile.push(card);
                }
                this.setState(new_state);
            } else {
                while(new_state.choose_pile.length > 0) {
                    let card = new_state.choose_pile.pop();
                    new_state.draw_pile.push(card);
                }
                this.setState(new_state);
            }
        }
    }

    get_drag_list(card_id, extra_info) {

        // Babel, I think, replaces all instances of "let" with "var",
        // so in some instances, it's necessary to pre-declare everything
        // at the top of our routine as with traditional C language.  I've
        // encountered some insane bugs otherwise, especialy if a loop variable
        // is declared and used in more than one for-loop.
        let card_list = [];
        let stack_list, top_card, card;
        let i, j;

        for(i = 0; i < this.state.stacks.length; i++) {
            stack_list = this.state.stacks[i];
            for(j = 0; j < stack_list.length; j++) {
                card = stack_list[j];
                if(card.id() == card_id && j >= this.state.hide_sizes[i]) {
                    extra_info.stack_i = i;
                    extra_info.stack_j = j;
                    for(let k = j; k < stack_list.length; k++)
                        card_list.push(stack_list[k]);
                    break;
                }
            }
        }

        if(this.state.choose_pile.length > 0) {
            top_card = this.state.choose_pile[this.state.choose_pile.length - 1];
            if(top_card.id() == card_id) {
                card_list = [top_card];
                extra_info.choose_pile = true;
            }
        }

        for(i = 0; i < this.state.suit_piles.length; i++) {
            stack_list = this.state.suit_piles[i];
            if(stack_list.length > 0) {
                top_card = stack_list[stack_list.length - 1];
                if(top_card.id() == card_id) {
                    card_list = [top_card];
                    extra_info.suit_pile_i = i;
                }
            }
        }

        return card_list;
    }

	card_mouse_down(event) {
        event.preventDefault();
        let extra_info = {};
        let drag_list = this.get_drag_list(event.target.id, extra_info);
        if(drag_list.length > 0) {
            this.drag_data = {
                x: event.clientX,
                y: event.clientY,
                total_dx: 0.0,
                total_dy: 0.0,
                drag_list: drag_list,
                extra_info: extra_info
            }
            document.onmouseup = this.card_mouse_up.bind(this);
            document.onmousemove = this.card_mouse_move.bind(this);
            for(let i in this.drag_data.drag_list) {
                let id = this.drag_data.drag_list[i].id();
                let element = document.getElementById(id);
                let z = parseInt(element.style.zIndex);
                element.style.zIndex = (z + 100).toString();
            }
        }
	}

	card_mouse_move(event) {
        event.preventDefault();
        let dx = event.clientX - this.drag_data.x;
        let dy = event.clientY - this.drag_data.y;
        this.drag_data.x = event.clientX;
        this.drag_data.y = event.clientY;
        this.drag_data.total_dx += dx;
        this.drag_data.total_dy += dy;
        for(let i in this.drag_data.drag_list) {
            let id = this.drag_data.drag_list[i].id();
            let element = document.getElementById(id);
            element.style.left = (element.offsetLeft + dx) + "px";
            element.style.top = (element.offsetTop + dy) + "px";
        }
	}

	card_mouse_up(event) {
	    document.onmouseup = null;
	    document.onmousemove = null;
	    let state_changed = this.execute_drop(event);
	    if(!state_changed) {
	        for(let i in this.drag_data.drag_list) {
                let id = this.drag_data.drag_list[i].id();
                let element = document.getElementById(id);
                element.style.left = (element.offsetLeft - this.drag_data.total_dx) + "px";
                element.style.top = (element.offsetTop - this.drag_data.total_dy) + "px";
                let z = parseInt(element.style.zIndex);
                element.style.zIndex = (z - 100).toString();
            }
        }
	    this.drag_data = null;
	}

    contains_cursor(element_id, event) {
	    let element = document.getElementById(element_id);
	    if(!element)
	        return false;
	    let rect = element.getBoundingClientRect();
	    if(event.clientX < rect.left)
	        return false;
	    if(event.clientX > rect.right)
	        return false;
	    if(event.clientY < rect.top)
	        return false;
	    if(event.clientY > rect.bottom)
	        return false;
	    return true;
	}

    set_state_if_different(new_state) {
        let cur_state_string = JSON.stringify(this.state);
        let new_state_string = JSON.stringify(new_state);
        if(cur_state_string === new_state_string)
            return false;
        this.setState(new_state);
        return true;
    }

	execute_drop(event) {

        // I get a bad bug if I don't pre-declare i and j here instead
        // of declaring them when using them in the for-loops.  I think
        // this is because babel replaces "let" with "var".
        let i, j;
        let new_state = jQuery.extend(true, {}, this.state);
        let dropped_card = this.drag_data.drag_list[0];
        let top_card;

        if("stack_i" in this.drag_data.extra_info && "stack_j" in this.drag_data.extra_info) {
            i = this.drag_data.extra_info.stack_i;
            j = this.drag_data.extra_info.stack_j;
            let stack_list = new_state.stacks[i];
            new_state.stacks[i] = stack_list.slice(0, j);
            if(new_state.stacks[i].length === new_state.hide_sizes[i])
                new_state.hide_sizes[i]--;
        } else if(this.drag_data.extra_info.choose_pile === true) {
            new_state.choose_pile.pop();
        } else if("suit_pile_i" in this.drag_data.extra_info) {
            new_state.suit_piles[this.drag_data.extra_info.suit_pile_i].pop();
        }

	    for(i = 0; i < new_state.stacks.length; i++) {
            let stack_list = new_state.stacks[i];
            if(stack_list.length > 0) {
                top_card = stack_list[stack_list.length - 1];
                if(this.contains_cursor(top_card.id(), event)) {
                    if(top_card.color() !== dropped_card.color() && top_card.number - 1 === dropped_card.number) {
                        new_state.stacks[i] = stack_list.concat(this.drag_data.drag_list);
                        return this.set_state_if_different(new_state);
                    }
                }
            } else {
                if(this.contains_cursor("stack_base_" + i, event)) {
                    if(dropped_card.number === 13) {
                        new_state.stacks[i] = this.drag_data.drag_list;
                        return this.set_state_if_different(new_state);
                    }
                }
            }
        }

        if(this.drag_data.drag_list.length === 1) {
            for(i = 0; i < new_state.suit_piles.length; i++) {
                let stack_list = new_state.suit_piles[i];
                if(stack_list.length === 0) {
                    if(dropped_card.number === 1 && this.contains_cursor("suit_pile_base_" + i, event)) {
                        new_state.suit_piles[i] = [dropped_card];
                        return this.set_state_if_different(new_state);
                    }
                } else {
                    top_card = stack_list[stack_list.length - 1];
                    if(top_card.number + 1 === dropped_card.number && this.contains_cursor(top_card.id(), event)) {
                        if(top_card.suit === dropped_card.suit) {
                            new_state.suit_piles[i].push(dropped_card);
                            return this.set_state_if_different(new_state);
                        }
                    }
                }
            }
        }

        return false;
	}

	render_draw_pile() {
	    if(this.state.draw_pile.length > 0)
            return <img src="images/deck/card_back.png" className="card" onClick={this.draw_pile_click.bind(this)}></img>;
        else
            return <img src="images/empty_stack.png" className="card" onClick={this.draw_pile_click.bind(this)}></img>;
	}
	
	render_choose_pile() {
	    if(this.state.choose_pile.length === 0)
            return <img src="images/empty_stack.png" className="card"></img>;
        else {
            let j = this.state.choose_pile.length - Math.min(3, this.state.choose_pile.length);
            return this.state.choose_pile.filter((card, i) => i >= j).map((card, i) => {
                let style = {
                    top: "0px",
                    left: (i * 20).toString() + "px",
                    zIndex: i.toString()
                };
                return <img id={card.id()} key={card.id()} src={card.image_src()} style={style} className="card" onMouseDown={this.card_mouse_down.bind(this)}></img>;
            });
        }
	}
	
	render_suit_pile(i) {
	    if(this.state.suit_piles[i].length > 0) {
            let length = this.state.suit_piles[i].length;
            let top_card = this.state.suit_piles[i][length - 1];
            let style = {
                zIndex: 0
            }
            return <img id={top_card.id()} key={top_card.id()} src={top_card.image_src()} style={style} className="card" onMouseDown={this.card_mouse_down.bind(this)}></img>;
        } else {
            return <img id={"suit_pile_base_" + i} src="images/empty_stack.png" className="card"></img>;
        }
	}
	
	render_stack(i) {
	    let stack_list = this.state.stacks[i];
	    if(stack_list.length == 0)
	        return <img src="images/empty_stack.png" className="card"></img>;
	    let offset = 0;
	    return stack_list.map((card, j) => {
            let style = {
                top: offset.toString() + "px",
                left: "0px",
                zIndex: j.toString()
            };
            let delta = j < this.state.hide_sizes[i] ? 20 : 40;
            offset += delta;
            let image_file = j < this.state.hide_sizes[i] ? "images/deck/card_back.png" : card.image_src();
            return <img id={card.id()} key={card.id()} src={image_file} style={style} className="card" onMouseDown={this.card_mouse_down.bind(this)}></img>;
        });
	}
	
	render() {
		let stack_div_list = [];
		stack_div_list.push(<div className="stack_base">{this.render_draw_pile()}</div>);
		stack_div_list.push(<div className="stack_base">{this.render_choose_pile()}</div>);
		stack_div_list.push(<div className="stack_base"></div>);
		for(let i = 0; i < this.state.suit_piles.length; i++)
			stack_div_list.push(<div className="stack_base">{this.render_suit_pile(i)}</div>);
		let first_row_of_stacks_div = React.createElement('div', {className: "row_of_stacks"}, ...stack_div_list);
		
		stack_div_list = [];
		for(let i = 0; i < this.state.stacks.length; i++)
			stack_div_list.push(<div className="stack_base" id={"stack_base_" + i}>{this.render_stack(i)}</div>);
		let second_row_of_stacks_div = React.createElement('div', {className: "row_of_stacks"}, ...stack_div_list);
		
		return React.createElement('div', null, first_row_of_stacks_div, second_row_of_stacks_div);
	}
}

var game = ReactDOM.render(<KlondikeSolitaire/>, document.getElementById("klondike_solitaire"));

var new_game_button_clicked = () => {
    game.new_game();
}

var undo_button_clicked = () => {
    game.undo();
}

var redo_button_clicked = () => {
    game.redo();
}