# Sound factory

## 背景

コミックSEでは, 漫画のコマごとに鳴らす効果音を指定する必要があります. 
しかし, 全てのコマに人手で効果音を割り振るのは多大な労力がかかり, 現実的ではありません. 
そのため, 私たちはコミックSEを現実的なサービスとするため, 自動でコマごとの音を付けるAIシステムを開発しました. 

## システム概要

このシステムは以下の三段階の構成をとっています.

* モデルデータ作成
* EfficientNetのファインチューニング
* ファインチューニングされたモデルを用いたコマの効果音推定

### モデルデータ作成

画像を分類するためにEfficientNetに学習させるための画像を用意する必要があります。このセクションでは, 画像を背景・オブジェクト・一つのコマを適切なディレクトリに配置することにより, 大量のデータを自動で作成します. 

### ファインチューニング

画像から適切な効果音を割り当てるには, EfficientNetをファインチューニングする必要があります. このセクションでは, 先ほど生成した大量の画像とそれに対する効果音を元にEfficientNetを学習させます. 

### 効果音推定

このセクションでは, 先ほど学習したEfficientNetを元に漫画のコマの効果音を推定します. 

## 使用技術

このシステムでは, 主にEfficientNetを使用しています. 

### EfficientNetとは

EfficientNetは, 2019年5月にGoogle Brainから発表されたモデルで, 以下の図の通り従来に比べ少ない計算量で高い精度を出した画像認識モデルです. モデルの深さ・広さ・解像度をバランスよくスケーリングすることにより性能向上されています. 
また, 以下の通り比較的単純なモデルで構成されています. 
<img src="https://github.com/jphacks/C_2008/blob/master/sound_factory/resources/image1.png">
<img src="https://github.com/jphacks/C_2008/blob/master/sound_factory/resources/image2.png">
[画像引用元](https://ai.googleblog.com/2019/05/efficientnet-improving-accuracy-and.html)


## 使用法

pythonのモジュールがないというエラーが出た場合以下のように必要なモジュールをインストールしてください. 

```
pip install -r requirements.txt
```

`requirements.txt`はsound_factory直下にあります. 

### モデルデータ作成

以下のようなディレクトリを構成します. 

```
sound_factory/
            ├make_database.py
            ├image_dataset/
            └image_sourse/
                        ├background/
                        ├object/
                        └oneshot/
```

そして, 背景はbackgroundの下に効果音の名前のディレクトリを作成しその下に画像を置きます. コマに加工を加えないものは, oneshotの下に効果音の名前のディレクトリを作成しその下に画像を置きます. オブジェクトの画像は, 背景を透過させてobjectの下に画像を置きます. その結果, 以下のようになります. 

```
sound_factory/
            ├make_database.py
            ├image_dataset/
            └image_sourse/
                        ├background/
                        |         ├sound1/
                        |         |     └1.png
                        |         └sound2/
                        |               ├1.png
                        |               └2.png
                        ├object/
                        |     ├1.png
                        |     └2.png
                        └oneshot/
                               ├sound1/
                               |     └1.png
                               └sound3/
                                     ├1.png
                                     └2.png
```

このような構成をしたうえで, 以下のようなコマンドで`make_database.py`を実行します.

```
python make_database.py
```

これで, `image_dataset`フォルダ以下に効果音ごとにディレクトリが作成され, その中に生成された画像が保存されます. 

### ファインチューニング

以下のコマンドを入力すると学習が開始され, `sound_factory/model`以下に学習済みモデルが保存されます. 

```
python train_sound_factory.py --model 0
```

`model`オプションはどのEfficientNetモデルを使用するか指定します. 0~7まで指定でき, 数字が大きいほど大きいモデルを使用します. `model`オプションを指定しない場合, 全てのEfficientNetモデルを学習します. 

### 効果音推定

以下のコマンドを入力すると漫画のコマの効果音を推定します. 結果は, 解析したファイルのパスと推定されたコマの効果音がペアとなった`manga_sound_labels.csv`に出力されます. 

```
python sound_factory.py hoge.png huga_directory --model b0
```

コマンドライン引数には解析対象のファイル, または, 解析対象のファイルがあるフォルダを指定します. これらは複数指定できます. 
`model`オプションはどのEfficientNetモデルを使用するか指定します. modelフォルダ以下のパスを指定します. デフォルトでは, `best/b0`となっています. 