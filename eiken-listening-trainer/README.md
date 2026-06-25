# 英検1級 質問リスニング

英検1級スピーキングテストの質疑応答を、1問ずつリスニング練習するための静的Webアプリです。

## 起動

```bash
cd /Users/hayatomatsui/Desktop/codex/eiken-listening-trainer
python3 -m http.server 8080
```

ブラウザで `http://localhost:8080` を開きます。`index.html` を直接開いても動きます。

## 内容

- `assets/questions.mp3` を19個の質問セクションに分割します。直接開いた時も固定タイムスタンプで再生できます。
- スクリプトカードを押すと、表示あり/リスニングのみを切り替えられます。
- リピート、自動次へ、速度変更、ランダム、苦手チェック、質問範囲の微調整に対応しています。
