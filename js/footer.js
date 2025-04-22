
$(function () {

  

  /*  글자 모션 */
  gsap.registerPlugin(ScrollTrigger);

  // ✅ 구조 유지하면서 텍스트를 글자별로 <span class="char">로 감싸기
  let textNode =null;
  function splitTextPreserveStructure(selector) {
    const targets = document.querySelectorAll(selector);

    targets.forEach(target => {
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, null, false);


      while ((textNode = walker.nextNode())) {
        const parent = textNode.parentNode;
        const text = textNode.textContent;

        const frag = document.createDocumentFragment();
        [...text].forEach(char => {
          const span = document.createElement("span");
          span.classList.add("char");

          // 공백은 그대로 삽입하되 스타일은 별도로 빼기 위해 클래스 추가
          if (char === " ") {
            span.innerHTML = "&nbsp;";
            span.classList.add("space");
          } else {
            span.textContent = char;
          }
          frag.appendChild(span);
        });
        parent.replaceChild(frag, textNode);
      }
    });
  }

  // ✅ 대상 선택자 (span 대신 이제 p, strong, li 등)
  splitTextPreserveStructure(`
     .footer_top .txt ul.left li,
    .footer_top .txt ul.right li
  `);

  // ✅ footer 영역 진입 시 애니메이션 트리거
  ScrollTrigger.create({
    trigger: ".footer_top",
    start: "top bottom",
    onEnter: () => {
      const chars = document.querySelectorAll(".footer_top .char");
      chars.forEach((char, i) => {
        char.style.transitionDelay = `${i * 0.01}s`;
        char.classList.add("on"); // ✅ 각 char에 on 클래스 개별 적용!
      });
    },
    onLeaveBack: () => {
      const chars = document.querySelectorAll(".footer_top .char");
      textNode =null;
      chars.forEach((char) => {
        char.style.transitionDelay = 0;
        char.classList.remove("on");
      });
    },
    toggleActions: "play none none reset"
  });



/* 떨어지는 프레임  */
gsap.registerPlugin(ScrollTrigger);

const footer = document.querySelector(".footer_top");
const tags = document.querySelectorAll(".footer_top .tag");
const canvas = document.getElementById("matter-canvas");

const width = window.innerWidth;
const height = footer.offsetHeight;




// Matter.js 기본 설정
const {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Events,
  Mouse,
  MouseConstraint,
  Body
} = Matter;

const engine = Engine.create();
const world = engine.world;





// ✅ 기존 canvas를 활용한 render
const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width,
    height,
    wireframes: false,
    background: 'transparent'
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);





// ✅ 바닥 생성
const ground = Bodies.rectangle(width / 2, height + 20, width, 40, {
  isStatic: true,
  render: { visible: false }
});
World.add(world, ground);





// ✅ 태그 → Matter Body로 변환
const bodies = [];
tags.forEach(tag => {
  tag.style.position = 'absolute';
  tag.style.opacity = 0;
  const rect = tag.getBoundingClientRect();





  // ✅ 화면 전체에 퍼지도록 x 위치 설정
  const x = gsap.utils.random(rect.width / 2 - 50, width - rect.width / 2 - 100);

  const body = Bodies.rectangle(x, -100, rect.width, rect.height, {
    restitution: 0.5,
    friction: 0.8,
    render: { visible: false }
  });

  World.add(world, body);
  bodies.push(body);
});

// ✅ Matter.js 위치 → DOM transform 동기화
Events.on(engine, 'afterUpdate', () => {
  tags.forEach((tag, i) => {
    const body = bodies[i];
    tag.style.transform = `translate(${body.position.x - tag.offsetWidth / 2}px, ${body.position.y - tag.offsetHeight / 2}px) rotate(${body.angle}rad)`;
  });
});




// ✅ 드래그 기능 추가
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: { visible: false }
  }
});
World.add(world, mouseConstraint);
render.mouse = mouse;




// ✅ ScrollTrigger로 재진입 시 다시 떨어지게
ScrollTrigger.create({
  trigger: ".footer_top",
  start: "top bottom",
  onEnter: () => {
    tags.forEach(tag => tag.style.opacity = 1);

    bodies.forEach((body, i) => {
      const tag = tags[i];
      Body.setPosition(body, {
        x: gsap.utils.random(tag.offsetWidth / 2 - 50, width - tag.offsetWidth / 2 - 100),
        y: -gsap.utils.random(100, 300)
      });
      Body.setVelocity(body, { x: 0, y: 0 });
      Body.setAngle(body, 0);
      Body.setAngularVelocity(body, 0);
    });
  },
  toggleActions: "restart none none reset"
});





});