from flask import Flask, render_template

app = Flask(__name__,
            static_folder='../comicse/dist',
            static_url_path='/',
            template_folder='../comicse/dist')

@app.route('/')
@app.route('/calibrate')
@app.route('/viewer')
def index():
    return render_template('index.html')

# Let's encrypt
@app.route('/.well-known/acme-challenge/<filename>')
def well_known(filename):
    return render_template('.well-known/acme-challenge/'+ filename)

if __name__ == '__main__':
    print(app.url_map)
    app.run()
