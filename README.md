# コミックSE

[![IMAGE ALT TEXT HERE](https://jphacks.com/wp-content/uploads/2020/09/JPHACKS2020_ogp.jpg)](https://www.youtube.com/watch?v=G5rULR53uMk)

## 漫画 × Tech

<img src="https://github.com/jphacks/C_2008/blob/master/comicse/src/assets/effects/dodon.png" width="100">

<!-- 漫画は好きですか？   -->
好きな漫画はありますか？  
面白いですよね.  

じゃあその漫画に**音**がついたらどうでしょう？  
コマを見た瞬間にそこに描かれた音が鳴るんです.  

迫力のあるワンシーンに効果音が付いたら？  
ここぞというタイミングで音楽が流れたら？  

わくわくが止まりません.  
<!-- それでは一緒に次の1ページを見てみましょう.   -->

<br>
<img src="https://github.com/jphacks/C_2008/blob/master/readme_resources/zu.png" width="100">

### デモ
**スマートフォンではなく，PCからご利用ください．**
[https://comic-se.work/](https://comic-se.work/)

### 背景
電子書籍が増えてきました.  
アナログの本が時代の波にのりデジタルに変わっています.  
電子書籍は大量の本を持ち歩けて、文字の検索やメモまで出来てしまいます.  

しかし、それはあくまで便利になったという話。  
本をデジタルにしたことによる恩恵は本当にそれだけでしょうか？  

私たちはデジタルになったことを活かし、漫画を鳴らすことにしました.  
これで漫画は新たな力を手にし、よりリッチになるのでは.  
**漫画とアニメの間のような新しい表現、新しい価値**が生まれるのではないでしょうか.  

音は大切です.  
その場の空気感や臨場感をまざまざと伝えてくれます.  
映画やアニメを見るなら、きっと素晴らしいタイミングで流れる音楽に心を動かされた経験があるでしょう.  

音が付いたあの漫画をもう一度読み直してみたい.  
漫画を読むだけじゃなくて、**漫画を聴ける**時代が来たら面白いじゃないですか.

<br>
<img src="https://github.com/jphacks/C_2008/blob/master/readme_resources/shubaba.png" width="190">

### 製品説明（具体的な製品の説明）
<!-- ![](https://github.com/jphacks/C_2008/) -->
Webサイトを開いたらまず、**「キャリブレーションする」** のボタンを押してください.  
![タイトルページ](https://github.com/jphacks/C_2008/blob/master/readme_resources/web_title.png)

画面が表示されたら、青い○を目で追ってください.  
これによってブラウザは、あなたの視線を学習します.  
![キャリブレーション](https://github.com/jphacks/C_2008/blob/master/readme_resources/web_calibration.png)

これで準備は完了です！  
漫画のコマを見るだけで、場面に応じた効果音を鳴らしてくれます！  
新しい電子漫画はいかがですか？  
![漫画ページ](https://github.com/jphacks/C_2008/blob/master/readme_resources/web_comic.png)

<br>
<img src="https://github.com/jphacks/C_2008/blob/master/readme_resources/gyun.png" width="150">

### 特長
#### 1. 漫画に描かれた効果音が鳴る
漫画には「ドカーン」「シャキーン」「メメタァ」などたくさんのオノマトペが描かれています.  
これを本当に鳴らすことができます.

#### 2. アイトラッキング
PC付属のカメラを使って、ユーザーの視線を推定しています.  
これによって、**コマを目で見るだけ**で音が鳴ります.  

なおこれは既存のライブラリでは目標の精度に届かなかったので、 アイトラッキングを一から独自実装しました. 

#### 3. リアルタイム性に優れたWebサイト
本サービスは非常に高速に利用できます.

Webサイトの動作を遅くする原因は主に、サーバーと通信を行うことで発生します.  
アイトラッキングにおいてこれは致命的です.  

そこで私たちは, **機械学習を含むすべての機能をフロントエンド**で実現しました.  
tensorflow.jsを用い、WebGLをバックエンドに採用しています.
従って、ブラウザで機械学習を行います.

#### 解決出来ること
みなさんに新しいエンターテインメントと価値観を提供できます.  

#### 注力したこと（こだわり等）
* ユーザビリティの高いWebサイトを作成しました
* リアルタイム性を重視し、機械学習を含む全ての機能をフロントエンドのみで実現しました
* アイトラッキングシステムは既存ライブラリを用いず、すべて独自実装しました.
* 既存の技術を超えるアイトラッキングの開発に挑戦しました
* 漫画のコマから音を推測するAIの開発に取り組みました.

<br>

<img src="https://github.com/jphacks/C_2008/blob/master/readme_resources/zawazawa.gif" width="150">   <img src="https://github.com/jphacks/C_2008/blob/master/readme_resources/zawazawa.gif" width="150">   <img src="https://github.com/jphacks/C_2008/blob/master/readme_resources/zawazawa.gif" width="150">

## 開発技術

### ハッカソンで開発した独自機能・技術
* アイトラッキングシステムを開発いたしました.
* 漫画のコマから音を推測するAIを開発いたしました.
* くわしくは[こちらのpdf](https://comic-se.work/docs/technology.pdf)に成果をまとめてあります．ご覧ください．

<!-- * 独自で開発したものの内容をこちらに記載してください -->
<!-- * 特に力を入れた部分をファイルリンク、またはcommit_idを記載してください。 -->

### 活用した技術
### API・データ
* 
* 

### フレームワーク・ライブラリ・モジュール
* [TensorFlow.js](https://www.tensorflow.org/js?hl=ja)
* [TensorFlow (Python)](https://www.tensorflow.org/?hl=ja)
* [AWS](https://aws.amazon.com/jp/)
* Flask
* vue.js
* 学習済みFacemeshモデル
* EfficientNet
<img src="https://github.com/jphacks/C_2008/blob/master/readme_resources/architecture.png" width="300">

### デバイス
* PCに内蔵カメラまたはWebカメラがあれば利用できます

### 製品に取り入れた研究内容（データ・ソフトウェアなど）（※アカデミック部門の場合のみ提出必須）
* [WebGazer: Scalable Webcam Eye Tracking Using User Interactions](http://cs.brown.edu/people/apapouts/papers/ijcai2016webgazer.pdf)
* [WebGazer (GitHub)](https://github.com/brownhci/WebGazer)
* [EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks](https://arxiv.org/abs/1905.11946)
* [MediaPipe Facemesh (GitHub)](https://github.com/tensorflow/tfjs-models/tree/master/facemesh)

<img src="https://github.com/jphacks/C_2008/blob/master/readme_resources/paka.png" width="150">

## 今後の展望

現システムでは、コマにどんな音を割り振るのかという情報は事前に設定しておく必要があります.  
これはアナログの本を電子化する手間を考えれば、大したことはないかもしれません.  

しかし自動で漫画のコマを読み取り、音をつけてくれたらそんな手間も必要なくなります.  
実際に私たちはこの信念の元、画像処理や機械学習を用いて**漫画のコマに音を付けるAIを開発しました**.  

私たちはこの問題を, コマの雰囲気の分類問題と捉えました。
AIは集中線や爆発エフェクト等を手掛かりに、自動で「緊張感のある」や「どっかーん」などのクラスに分けます. あとはそれに対応した音を鳴らせば良い。
そしてこの分類問題の精度は**80%** を超えました.
技術の詳細については、下記を参照していただければと思います.  
[C_2008(コミックSE)/sound_factory](https://github.com/jphacks/C_2008/blob/master/sound_factory/Readme.md)

この技術によって、**任意の漫画に音を自動で割り当てるのは実用レベルで実現可能**であると言えるでしょう.

残念ながら、ハッカソンの期間内でこの技術をサービスに組み込むまでは至りませんでしたので、今後の展望といたします.
