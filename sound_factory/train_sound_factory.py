import argparse
import os
import csv
import numpy as np
import pandas as pd
import matplotlib.pylab as plt
import tensorflow as tf
import tensorflow_hub as hub
from tensorflow.keras import layers
from tensorflow.keras.callbacks import EarlyStopping , ModelCheckpoint


IMAGE_SHAPE = [(224, 224, 3), (240, 240, 3), (260, 260, 3), (300, 300, 3), (380, 380, 3), (456, 456, 3), (528, 528, 3), (600, 600, 3)]

def main(efficientModel: int):

    data_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'image_dataset')

    image_generator = tf.keras.preprocessing.image.ImageDataGenerator(rescale=1/255,width_shift_range=0.25, height_shift_range=0.25, zoom_range=0.25, fill_mode='constant', cval=1.0 , horizontal_flip=True, validation_split=0.2)
    image_data = image_generator.flow_from_directory(data_path,target_size=(IMAGE_SHAPE[efficientModel][0:2]), batch_size=64, subset='training', interpolation='lanczos')
    val_data = image_generator.flow_from_directory(data_path, target_size=(IMAGE_SHAPE[efficientModel][0:2]), batch_size=64, subset='validation', interpolation='lanczos')

    feature_extractor_url = 'https://tfhub.dev/google/efficientnet/b' + str(efficientModel) + '/feature-vector/1'
    feature_extractor_layer = hub.KerasLayer(feature_extractor_url,input_shape=IMAGE_SHAPE[efficientModel])
    feature_extractor_layer.trainable = False

    model = tf.keras.Sequential([feature_extractor_layer])
    model.compile(optimizer=tf.keras.optimizers.Adam(),loss='categorical_crossentropy',metrics=['acc'])
    
    output_shape = model.output_shape[1]
    units = 16
    while units <= output_shape:
        units *= 4
    units /= 4
    while units / 16 > image_data.num_classes:
        units /= 4
        model.add(layers.Dense(units, kernel_regularizer='l2', activation='relu'))

    model.add(layers.Dense(image_data.num_classes, kernel_regularizer='l2', activation='softmax'))
    model.compile(optimizer=tf.keras.optimizers.Adam(),loss='categorical_crossentropy',metrics=['acc'])
    model.summary()
    epochs = 200
    steps_per_epoch = np.ceil(image_data.samples/image_data.batch_size)
    val_steps = np.ceil(val_data.samples/val_data.batch_size)
    early_stopping = EarlyStopping(monitor='val_acc', min_delta=0.01, patience=15, verbose=1, mode='auto')
    save_best_model = ModelCheckpoint(os.path.join(os.path.abspath(os.path.dirname(__file__)),'model', 'best' , 'b' + str(efficientModel)), monitor='val_acc', save_best_only=True, period=1)
    history = model.fit_generator(image_data, epochs=epochs,steps_per_epoch=steps_per_epoch, verbose=1, validation_data=val_data, validation_steps=val_steps, callbacks=[early_stopping, save_best_model])

    '''
    pridict = model.predict_generator(val_data)
    with open('pridict.csv', mode='w') as f1:
        writer = csv.writer(f1)
        writer.writerows(pridict)

    with open('label.csv', mode='w') as f2:
        writer2 = csv.writer(f2)
        for image_batch, label_batch in image_data:
            writer2.writerows(label_batch)
            break
    
    fig = plt.figure()
    ax1 = fig.add_subplot(2,2,1)
    ax2 = fig.add_subplot(2,2,2)
    ax3 = fig.add_subplot(2,2,3)
    ax4 = fig.add_subplot(2,2,4)

    ax1.plot(history.history['acc'], label='acc')
    ax2.plot(history.history['val_acc'], label='val_acc')
    ax3.plot(history.history['loss'], label='loss')
    ax4.plot(history.history['val_loss'], label='val_loss')
    plt.show()
    '''
    log = [history.history['acc'], history.history['loss'], history.history['val_acc'], history.history['val_loss']]
    log = list(zip(*log)) 
    with open(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'model', 'b' + str(efficientModel) + '.csv'), mode='w', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(log)


    model.save(os.path.join(os.path.abspath(os.path.dirname(__file__)),'model', 'b' + str(efficientModel)))

    labels = sorted(os.listdir(data_path))
    with open(os.path.join(os.path.abspath(os.path.dirname(__file__)),'model', 'b' + str(efficientModel), 'labels.txt'), mode='w', encoding='utf-8') as f1:
        for label in labels:
            f1.write(label)
            f1.write('\n')

    with open(os.path.join(os.path.abspath(os.path.dirname(__file__)),'model', 'best', 'b' + str(efficientModel), 'labels.txt'), mode='w', encoding='utf-8') as f2:
        for label in labels:
            f2.write(label)
            f2.write('\n')


    del log
    del model
    del history
    del image_generator
    del image_data
    del val_data
    del feature_extractor_layer

    tf.keras.backend.clear_session()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='EfficientNetのファインチューニングをします')
    parser.add_argument('--model',type=int ,help='ファインチューニングするモデル名')
    args = parser.parse_args()
    if parser.model is None:
        for i in range(8):
            main(i)
    else:
        if args.model >= 0 and args.model <= 7
            main(args.model)
