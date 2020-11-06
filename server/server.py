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

if __name__ == '__main__':
    print(app.url_map)
    app.run()
