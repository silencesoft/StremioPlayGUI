import fetch from 'isomorphic-fetch'

export const server = 'http://127.0.0.1:11470';

const headers = {
    'Accept': 'application/json',
}

export const get = () =>
  fetch(`${server}/casting/vlc/player`, { headers })
    .then(res => res.json())
    .then(data => data)
    .catch(error => {
        throw(error);
    });

export const stats = () =>
    fetch(`${server}/stats.json`, { headers })
      .then(res => res.json())
      .then(data => data)
      .catch(error => {
          throw(error);
      });
  
export const start = (url) =>
    fetch(`${url}`, {
        method: 'POST',
    });

export const test = (url) => {
    url = `${url}/stream-q-1080.m3u8`;

    return new Promise((resolve, reject) => {
        Promise.all([
            fetch(url),
            fetch(url.replace('1080', '720')),
            fetch(url.replace('1080', '480')),
            fetch(url.replace('1080', '320')),
        ]).then(responses => {
            if (responses[0].status !== 404) {
                resolve('1080');
            } else if (responses[1].status !== 404) {
                resolve('720');
            } else if (responses[2].status !== 404) {
                resolve('480');
            } else if (responses[3].status !== 404) {
                resolve('320');
            } else {
                resolve('0');
            }
        })
        .catch(error => {
            throw(error);
        });
    });
};
