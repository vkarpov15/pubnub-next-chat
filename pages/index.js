const PubNub = require('pubnub');
const React = require('react');
const config = require('../config.client.json');
const superagent = require('superagent');

const clientColors = ['FF0B69', '1DACCC', '1195B2', 'FFEB25', 'ccbc1d'];

export default class extends React.Component {
  static async getInitialProps({ req }) {
    if (req) {
      return req.state;
    }

    const { messages } = await superagent.get('http://localhost:3000/message').
      then(res => res.body);
    return { messages };
  }

  constructor() {
    super();
    this.state = { input: '' };
    this.client = clientColors[Math.floor(Math.random() * clientColors.length)];
  }

  componentDidMount() {
    this.pubnub = new PubNub({
      subscribeKey: config.subscribeKey
    });

    this.pubnub.subscribe({
      channels: ['messages']
    });

    this.pubnub.addListener({
      message: ({ message }) => {
        this.setState(Object.assign({}, this.state, {
          messages: (this.state.messages || this.props.messages).concat([message])
        }));
      }
    });
  }

  componentWillUnmount() {
    this.pubnub.unsubscribe();
  }

  setInput() {
    return ev => {
      const state = this.state || {};
      this.setState(Object.assign({}, state, {
        input: ev.target.value
      }));
    };
  }

  submitMessage() {
    return ev => {
      superagent.post(`/message/${this.client}`, { message: this.state.input }).
        then(() => {
          this.setState(Object.assign({}, this.state, { input: '' }));
        })
    }
  }

  render() {
    const messages = this.state.messages || this.props.messages;
    return (
      <div id="container">
        <h1>
          Nanochat
        </h1>
        <div id="messages">
          {
            messages.map(message => {
              return (
                <div className="message">
                  <span style={{color: `#${message.client}`}}>
                    {message.client}
                  </span>
                  <span className="content">
                    {message.content}
                  </span>
                </div>
              );
            })
          }
        </div>
        <div className="message-input">
          <textarea value={this.state.input} onChange={this.setInput()}>
          </textarea>
          <button onClick={this.submitMessage()}>Submit</button>
          <div className="clear"></div>
        </div>
        <style jsx>{`
          div {
            font-family: 'Helvetica', 'sans-serif';
          }
          #container {
            width: 800px;
            margin-left: auto;
            margin-right: auto;
            padding: 15px;
          }
          #messages {
            border: 1px solid #fafafa;
            padding: 5px;
            margin-bottom: 15px;
          }
          .message {
            margin-bottom: 0.33em;
          }
          h1 {
            color: #ccbc1d;
          }
          .clear {
            clear: both;
          }
          button {
            background-color: #ff257b;
            color: #ffffff;
            font-weight: bold;
            border: 0px;
            border-radius: 2px;
            height: 2em;
            padding-left: 8px;
            padding-right: 8px;
            margin: 5px;
            float: left;
          }
          textarea {
            height: 2.1em;
            margin: 5px;
            float: left;
            width: 330px;
            border-radius: 2px;
          }
          .content {
            margin-left: 1em;
          }
        `}</style>
      </div>
    )
  }
}
