const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const navigationLinks = $$('nav a')

const animationDuration = 1000

const setNextSlide = () => {
  const prevSlide = $('.slide-active')
  const nextSlide = prevSlide.nextElementSibling || $$('.slide')[1]

  setSlide({ prevSlide, nextSlide, direction: 'next' })
}

const setPrevSlide = () => {
  const prevSlide = $('.slide-active')

  const { previousElementSibling } = prevSlide
  const nextSlide = previousElementSibling.id !== 'no-slide' ? previousElementSibling : Array.from($$('.slide')).at(-1)

  setSlide({ prevSlide, nextSlide, direction: 'prev' })
}

let animated
const setSlide = ({ prevSlide = $('.slide-active'), nextSlide, direction = 'next' }) => {
  if (animated) return
  
  animated = true

  if (prevSlide) {
    prevSlide.classList.remove('slide-active')
    if (direction === 'next') {
      prevSlide.classList.add('slide-inactive')
    } else if (direction === 'prev') {
      prevSlide.classList.add('slide-inactive-up')
    }
  }

  nextSlide.classList.add('slide-active')
  nextSlide.classList.remove('slide-inactive')
  nextSlide.classList.remove('slide-inactive-up')

  nextSlide.scrollTop = 0

  history.pushState(null, null, `${nextSlide.id}`)

  navigationLinks.forEach(link => {
    link.classList.remove('active')
    if (link.getAttribute('href').substring(1) === nextSlide.id) {
      link.classList.add('active')
    } else {
      link.classList.remove('active')
    }
  })
  
  setTimeout(() => {
    animated = false
  }, animationDuration)
}

const slide = $(`#${location.pathname.substring(1) === '' ? 'inicio' : location.pathname.substring(1)}`)
setSlide({ nextSlide: slide})

navigationLinks.forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault()

    const target = event.target.getAttribute('href')

    const nextSlide = document.querySelector(`#${target.substring(1)}`)

    setSlide({ nextSlide })
  })
})

window.addEventListener('popstate', () => {
  const nextSlide = $(`#${location.pathname.substring(1)}`)

  setSlide({ nextSlide })
})

window.addEventListener('keydown', event => {
  const key = event.key

  if (key === 'ArrowDown' || key === 'ArrowRight') {
    return setNextSlide()
  }
  
  if (key === 'ArrowUp' || key === 'ArrowLeft') {
    return setPrevSlide()
  }
})

$$('.slide').forEach(slide => {
  slide.addEventListener('wheel', event => {
    const { deltaY } = event

    const { scrollTop, clientHeight, scrollHeight } = slide

    if (deltaY > 0 && scrollTop + clientHeight >= scrollHeight - 5) {

      return setNextSlide()
    }

    if (deltaY < 0 && scrollTop === 0) {
      return setPrevSlide()
    }
  })

  slide.addEventListener('touchstart', event => {
    const { clientY } = event.changedTouches[0]
    const { scrollTop, clientHeight, scrollHeight } = slide

    slide.setAttribute('data-touch-start', clientY)
    if (scrollTop === 0) {
      slide.setAttribute('data-touch-start-top', true)
    } else {
      slide.removeAttribute('data-touch-start-top')
    }

    if (scrollTop + clientHeight >= scrollHeight - 2) {
      slide.setAttribute('data-touch-start-bottom', true)
    } else {
      slide.removeAttribute('data-touch-start-bottom')
    }
  })

  slide.addEventListener('touchmove', event => {
    const { clientY } = event.changedTouches[0]
    const { scrollTop, clientHeight, scrollHeight } = slide

    slide.removeAttribute('data-touch-next')

    const touchStart = slide.getAttribute('data-touch-start')

    if (touchStart) {
      const delta = touchStart - clientY

      if (delta > 0 && scrollTop + clientHeight >= scrollHeight - 2 && slide.getAttribute('data-touch-start-bottom')) {
        return slide.setAttribute('data-touch-next', 'next')
      }

      if (delta < 0 && scrollTop === 0 && slide.getAttribute('data-touch-start-top')) {
        return slide.setAttribute('data-touch-next', 'prev')
      }
    }
  })

  slide.addEventListener('touchend', () => {
    const next = slide.getAttribute('data-touch-next')

    slide.removeAttribute('data-touch-start')
    slide.removeAttribute('data-touch-start-bottom')
    slide.removeAttribute('data-touch-start-top')
    slide.removeAttribute('data-touch-next')

    if (next === 'next') {
      return setNextSlide()
    }

    if (next === 'prev') {
      return setPrevSlide()
    }
  })
})