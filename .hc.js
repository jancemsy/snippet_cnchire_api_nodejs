module.exports = {
  recursive: true,
  exclude: (filename, path) => path.match(/utils/)
}
