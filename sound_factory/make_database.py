from PIL import Image
import os
import re
import random


def main():
    make_directorys()
    r = re.compile(r'.(png)|(jpg)|(jpeg)|(bmp)|(gif)|(ico)')
    for label in os.listdir(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'image_sourse', 'background')):
        for img_filename in os.listdir(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'image_sourse', 'background', label)):
            if r.search(img_filename) is None:
                continue
            base_img = Image.open(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'image_sourse','background', label, img_filename))
            imgs = resize_image(base_img)
            filename = re.sub(r'\..+', '', img_filename)
            for idx in range(5):
                imgs[idx].save(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'image_dataset', label, filename + '-' + str(idx) + '.png'))

    
    objs = list(os.listdir(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'image_sourse', 'object')))

    for label in os.listdir(os.path.abspath(os.path.dirname(__file__)), 'image_dataset'):
        for img_filename in os.listdir(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'image_dataset', label)):
            if r.search(img_filename) is None:
                continue
            base_img = Image.open(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'image_dataset', label, img_filename)).convert('RGBA')
            filename = re.sub(r'\..+', '', img_filename)
            for idx in range(15):
                overlay_img = Image.open(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'image_sourse','object', objs[random.randrange(len(objs))]))
                x = random.random() - 0.5
                y = random.random() - 0.5
                img = make_overlay(base_img, overlay_img, x, y)
                img.save(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'image_dataset', label, filename + '-' + str(idx) + '.png'))

    for label in os.listdir(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'image_sourse', 'oneshot')):
        for img_filename in os.listdir(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'image_sourse', 'oneshot', label)):
            if r.search(img_filename) is None:
                continue
            base_img = Image.open(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'image_sourse','oneshot', label, img_filename))
            imgs = resize_image(base_img)
            filename = re.sub(r'\..+', '', img_filename)
            for idx in range(5):
                imgs[idx].save(os.path.join(os.path.abspath(os.path.dirname(__file__)), 'image_dataset', label, filename + '-' + str(idx) + '.png'))




def make_directorys():
    labels = []
    labels.extend(os.listdir(os.path.join('image_sourse','background')))
    labels.extend(os.listdir(os.path.join('image_sourse','oneshot')))
    labels = set(labels)
    for label in labels:
        os.mkdir(os.path.join('image_dataset',  label))

def resize_image(img):
    size = img.size
    img1 = img.crop((0, size[1] / 4, size[0], size[1] / 2))
    img2 = img.crop((0, size[1] / 8, size[0], size[1] * 3 / 4))
    img3 = img
    img4 = img.crop((size[0] / 4, 0, size[0] / 2, size[1]))
    img5 = img.crop((size[0] / 8, 0, size[0] * 3 / 4, size[1]))

    return (img1, img2, img3, img4, img5)

def make_overlay(base_img, overlay_img, x, y):
    coeff = max(overlay_img.size) / max(base_img.size)
    overlay_resized = overlay_img.resize((int(overlay_img.width * coeff), int(overlay_img.height * coeff)), resample=Image.LANCZOS)
    overlay = Image.new('RGBA', base_img.size, (255,255,255,0))
    overlay.paste(overlay_resized, (int(base_img.width * x), int(base_img.height * y)), overlay_resized)
    return Image.alpha_composite(base_img, overlay)

if __name__ == '__main__':
    main()