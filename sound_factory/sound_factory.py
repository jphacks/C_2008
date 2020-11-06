import os
import re
import argparse
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.preprocessing.image import load_img, img_to_array


IMAGE_SHAPE = [(224, 224), (240, 240), (260, 260), (300, 300), (380, 380), (456, 456), (528, 528), (600, 600)]

def main(paths : list, model_name : str):
    try:
        model = tf.keras.models.load_model(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'model', model_name))
    except Exception:
        print('そのようなモデルはありません')
        exit()

    model_index = int(re.search('\d', model_name).group(0))
    with open(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'model', model_name, 'labels.txt'), mode='r', encoding='utf-8') as f1:
        labels = [s.strip() for s in f1.readlines()]
    
    with open('manga_sound_labels.csv', mode='w', encoding='utf-8') as f2:
        for path in paths:
            if os.path.isfile(path):
                try:
                    img = np.expand_dims(img_to_array(load_img(path,target_size=IMAGE_SHAPE[model_index])) / 255, axis=0)
                except Exception:
                    continue
                pridict = labels[np.argmax(model.predict(img)[0])]
                f2.write(path + ',' + pridict + '\n')
            else:
                for filename in os.listdir(path):
                    try:
                        img = np.expand_dims(img_to_array(load_img(os.path.join(path, filename),target_size=IMAGE_SHAPE[model_index])) / 255, axis=0)
                    except Exception:
                        continue
                    pridict = labels[np.argmax(model.predict(img)[0])]
                    f2.write(os.path.join(path, filename) + ',' + pridict + '\n')




if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='コマの画像から背景音を予測します')
    parser.add_argument('path',nargs='*', help='解析するファイル名かディレクトリ名')
    parser.add_argument('--model', default=os.path.join('best','b0'), help='クラス分けに使用するモデル名')
    args = parser.parse_args()
    if 'manga_sound_labels.csv' in os.listdir(os.getcwd()):
        print('manga_sound_labels.csvがすでにあるので終了します')
        exit()
    main(args.path, args.model)