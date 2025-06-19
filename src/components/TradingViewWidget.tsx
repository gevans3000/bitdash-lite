'use client';

import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current && !container.current.querySelector('script')) {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = `
          {
            "autosize": true,
            "symbol": "BINANCE:BTCUSDT",
            "interval": "5",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "withdateranges": true,
            "toolbar_bg": "#1e222d",
            "studies": [
              "VWAP@tv-basicstudies",
              "VPVR@tv-basicstudies",
              {
                "id": "EMAExp@tv-basicstudies",
                "inputs": {
                  "length": 9
                }
              },
              {
                "id": "EMAExp@tv-basicstudies",
                "inputs": {
                  "length": 21
                }
              },
              "RSI@tv-basicstudies",
              "MACD@tv-basicstudies"
            ]
          }`;
        container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
    </div>
  );
}

export default memo(TradingViewWidget);