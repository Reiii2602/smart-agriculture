/* js/home.js */
document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  const loaderFill = splash ? splash.querySelector('.splash-loader-fill') : null;

  const startSplashSequence = () => {
    if (!splash || !loaderFill) return;

    let progress = 0;
    const totalDuration = 1500;
    const tickMs = 24;

    const ticker = setInterval(() => {
      progress = Math.min(progress + 100 / (totalDuration / tickMs), 100);
      loaderFill.style.width = `${progress}%`;
    }, tickMs);

    setTimeout(() => {
      clearInterval(ticker);
      loaderFill.style.width = '100%';
      splash.style.opacity = '0';

      setTimeout(() => {
        splash.remove();
      }, 400);
    }, totalDuration);
  };

  startSplashSequence();
});
