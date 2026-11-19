import math
def blade(B,T,bend=0.25,w=3.2,bend2=None):
    """Tapered curved blade from base B (width w) to sharp tip T."""
    bx,by=B; tx,ty=T
    dx,dy=tx-bx,ty-by; L=math.hypot(dx,dy); ux,uy=dx/L,dy/L; px,py=-uy,ux
    if bend2 is None: bend2=bend*0.55
    def pt(t,off): return (bx+dx*t+px*off, by+dy*t+py*off)
    a0=(bx+px*w,by+py*w); a1=(bx-px*w,by-py*w)
    c1=pt(.33,bend*L+w*.9); c2=pt(.72,bend*L*.85+w*.3)
    d1=pt(.72,bend2*L-w*.3); d2=pt(.33,bend2*L-w*.9)
    f=lambda p:f"{p[0]:.1f} {p[1]:.1f}"
    return f"M{f(a0)}C{f(c1)} {f(c2)} {f(T)}C{f(d1)} {f(d2)} {f(a1)}Z"
half=[
 blade((100,74),(26,2),bend=.28,w=3.4),        # upper horn
 blade((62,44),(70,14),bend=-.25,w=1.6),       # horn barb
 blade((100,128),(2,176),bend=-.22,w=4.2),     # main wing
 blade((44,152),(30,112),bend=.3,w=1.8),       # wing barb up
 blade((40,156),(46,206),bend=-.3,w=1.8),      # wing curl down
 blade((100,214),(38,244),bend=.25,w=2.6),     # mid thorn
 blade((100,268),(58,394),bend=-.18,w=3.4),    # long lower sweep
 blade((80,318),(62,304),bend=.2,w=1.4),       # lower barb
]
spine=("M100 0 C103 90 104 150 101 200 C104 250 103 330 100 400 "
       "C97 330 96 250 99 200 C96 150 97 90 100 0Z")
nodes="M100 186 L108 200 L100 214 L92 200Z M100 102 L105 112 L100 122 L95 112Z M100 292 L106 300 L100 308 L94 300Z"
out=f'''    <g id="sigil-half">\n''' + "".join(f'      <path d="{p}"/>\n' for p in half) + '''    </g>'''
print(out)
print("SPINE",spine)
print("NODES",nodes)
