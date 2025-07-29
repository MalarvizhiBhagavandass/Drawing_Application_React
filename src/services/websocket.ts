type MessageCallback = (token: string) => void;
type ErrorCallback = (error: Error) => void;
type CompletionCallback = () => void;

export class WebSocketService {
  private socket: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number = 1000;
  private messageCallback: MessageCallback | null = null;
  private errorCallback: ErrorCallback | null = null;
  private completionCallback: CompletionCallback | null = null;
  private abortController: AbortController | null = null;

  constructor(private url: string = 'wss://mock-trading-ai-service.example.com') {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('WebSocket: Connecting to', this.url);
        setTimeout(() => {
          this.isConnected = true;
          console.log('WebSocket: Connected successfully');
          this.reconnectAttempts = 0;
          resolve();
        }, 500);
      } catch (error) {
        console.error('WebSocket: Connection error', error);
        this.handleConnectionError();
        reject(error);
      }
    });
  }

  private handleConnectionError(): void {
    this.isConnected = false;
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`WebSocket: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      const timeout = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1);
      setTimeout(() => this.connect(), timeout);
    } else {
      console.error('WebSocket: Max reconnection attempts reached');
      if (this.errorCallback) {
        this.errorCallback(new Error('Failed to connect after maximum reconnection attempts'));
      }
    }
  }

  sendMessage(message: string, systemPrompt: string, model: string): void {
    if (!this.isConnected) {
      console.error('WebSocket: Cannot send message, not connected');
      if (this.errorCallback) {
        this.errorCallback(new Error('WebSocket is not connected'));
      }
      return;
    }

    console.log(`WebSocket: Sending message with model ${model}...`);
    this.abortController = new AbortController();
    this.mockStreamingResponse(message, systemPrompt, model);
  }

  onMessage(callback: MessageCallback): void {
    this.messageCallback = callback;
  }

  onError(callback: ErrorCallback): void {
    this.errorCallback = callback;
  }

  onCompletion(callback: CompletionCallback): void {
    this.completionCallback = callback;
  }

  stopStreaming(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      console.log('WebSocket: Streaming stopped by user');
    }
  }

  disconnect(): void {
    this.isConnected = false;
    this.abortController = null;
    console.log('WebSocket: Disconnected');
  }

  private mockStreamingResponse(message: string, systemPrompt: string, model: string): void {
    const abortSignal = this.abortController?.signal;

    let response = '';

    if (message.toLowerCase().includes('market') || message.toLowerCase().includes('trade')) {
      response = "Based on recent market analysis, trading volumes have increased by 15% in the technology sector. The primary indicators suggest a bullish trend continuing for the next quarter, with particular strength in semiconductor stocks. However, be cautious about potential volatility due to upcoming economic data releases. Would you like me to analyze specific trading opportunities or provide a more detailed sector breakdown?";
    } else if (message.toLowerCase().includes('analysis') || message.toLowerCase().includes('report')) {
      response = "I've prepared a comprehensive analysis based on the latest market data. Key findings include:\n\n1. **Sector Performance**: Technology +3.2%, Healthcare +1.8%, Financials -0.7%\n2. **Volume Trends**: 20% above 30-day average\n3. **Technical Indicators**: RSI showing overbought conditions in major indices\n\nThe data suggests positioning defensively while maintaining exposure to high-quality growth stocks with strong balance sheets.";
    } else {
      response = "I understand you're looking for trading insights. To provide the most relevant information, could you specify whether you're interested in:\n\n1. Market trend analysis\n2. Specific stock recommendations\n3. Risk assessment for your current portfolio\n4. Economic data interpretation\n\nAs your trading assistant, I can provide more tailored guidance with additional context about your investment objectives and time horizon.";
    }

    const tokens = response.split(/(\s+|[.,!?;:])/);

    let tokenIndex = 0;

    const streamNextToken = () => {
      if (abortSignal?.aborted) {
        if (this.completionCallback) {
          this.completionCallback();
        }
        return;
      }

      if (tokenIndex < tokens.length) {
        const token = tokens[tokenIndex];
        tokenIndex++;

        if (this.messageCallback) {
          this.messageCallback(token);
        }

        const delay = token.match(/[.,!?;:]/) ? 200 : token.length * 20 + Math.random() * 50;
        setTimeout(streamNextToken, delay);
      } else {
        if (this.completionCallback) {
          this.completionCallback();
        }
      }
    };

    const thinkingDelay = model.includes('gpt-4') ? 2000 : 800;
    setTimeout(streamNextToken, thinkingDelay);
  }
}

export const websocketService = new WebSocketService();
