# -*- coding: utf-8 -*-
"""DES-II en Excel, con la correccion calculada.

openpyxl se usa aqui sin miedo porque el libro se crea de cero: lo que rompia el
Excel de la clinica era reescribir uno ajeno con formato condicional y validacion
que openpyxl no sabe modelar. Todo lo que hay aqui lo escribe el, asi que nada
se pierde.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'salida')
AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.makedirs(SALIDA_DIR, exist_ok=True)

import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule
from openpyxl.utils import get_column_letter
from openpyxl.drawing.image import Image
from contenido.des2 import ITEMS, DES_T, INSTRUCCIONES, FUENTE

SALIDA = os.path.join(SALIDA_DIR, 'DES-II - Hogar Terapeutico.xlsx')
BANDA = os.path.join(AQUI, 'marca-img', 'banda.png')

CLAY_800, CLAY_700, CLAY_600 = '4C2F2D', '6B4340', '85554F'
CLAY_300, CLAY_200, CLAY_100, CLAY_50 = 'D5A49C', 'E7C7C1', 'F4E3DF', 'FBF2F0'
SAGE_700, SAGE_100, SAGE_50 = '38534A', 'DDE9E1', 'F1F6F2'
CANVAS, INK, INK_MUTE = 'FEFBF8', '4A3B3B', '6E5B58'
TAXON_FDO = 'F8EDEA'

F = lambda **kw: Font(name='Public Sans', **kw)
R = lambda c: PatternFill('solid', fgColor=c)
linea = Side(style='thin', color=CLAY_200)

wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'DES-II'
ws.sheet_view.showGridLines = False

FILA_1 = 14                      # el item 1
ULTIMA = FILA_1 + len(ITEMS) - 1
fila_de = lambda n: FILA_1 + n - 1

ws.column_dimensions['A'].width = 4.5
ws.column_dimensions['B'].width = 88
ws.column_dimensions['C'].width = 13
ws.column_dimensions['D'].width = 2.5
ws.column_dimensions['E'].width = 20
ws.column_dimensions['F'].width = 12

# --- membrete ---------------------------------------------------------------
if os.path.exists(BANDA):
    img = Image(BANDA)
    img.width, img.height = 340, 60
    ws.add_image(img, 'A1')
ws.row_dimensions[1].height = 22
ws.row_dimensions[2].height = 22
ws.row_dimensions[3].height = 10

ws['A5'] = 'Escala de Experiencias Disociativas · DES-II'
ws['A5'].font = F(size=15, bold=True, color=CLAY_600)
ws.merge_cells('A5:C5')
ws.row_dimensions[5].height = 24

for cel, rot in (('A6', 'Fecha'), ('C6', 'Código')):
    ws[cel] = rot
    ws[cel].font = F(size=8, bold=True, color=INK_MUTE)
ws['B6'].fill = R(CLAY_50); ws['B6'].border = Border(bottom=linea)
ws['C6'].alignment = Alignment(horizontal='right')

ws['A8'] = INSTRUCCIONES
ws['A8'].font = F(size=9, color=INK)
ws['A8'].alignment = Alignment(wrap_text=True, vertical='top')
ws.merge_cells('A8:C8')
ws.row_dimensions[8].height = 42

# --- panel de resultados, arriba para que quede siempre a la vista ----------
rango = f'C{FILA_1}:C{ULTIMA}'
taxon = ','.join(f'C{fila_de(n)}' for n in sorted(DES_T))
PANEL = [
    ('Respondidos', f'=COUNT({rango})&" de {len(ITEMS)}"',
     'Si faltan ítems, la media engaña.'),
    ('DES total', f'=IF(COUNT({rango})=0,"",ROUND(AVERAGE({rango}),1))',
     'Media de los 28. Referencia orientativa: desde 30, explorar a fondo.'),
    ('DES-T', f'=IF(COUNT({rango})=0,"",ROUND(AVERAGE({taxon}),1))',
     'Media de los 8 ítems del taxón, más específicos de disociación patológica.'),
]
ws['E5'] = 'CORRECCIÓN'
ws['E5'].font = F(size=8, bold=True, color=INK_MUTE)
for i, (rot, formula, nota) in enumerate(PANEL):
    f = 6 + i * 2
    ws[f'E{f}'] = rot
    ws[f'E{f}'].font = F(size=10, bold=True, color=CLAY_700)
    ws[f'F{f}'] = formula
    ws[f'F{f}'].font = F(size=13, bold=True, color=CLAY_800)
    ws[f'F{f}'].fill = R(CANVAS)
    ws[f'F{f}'].border = Border(top=linea, bottom=linea, left=linea, right=linea)
    ws[f'F{f}'].alignment = Alignment(horizontal='center')
    ws[f'E{f+1}'] = nota
    ws[f'E{f+1}'].font = F(size=7.5, color=INK_MUTE)
    ws[f'E{f+1}'].alignment = Alignment(wrap_text=True, vertical='top')
    ws.merge_cells(f'E{f+1}:F{f+1}')
    ws.row_dimensions[f+1].height = 22

ws['E12'] = ('=IF(F8="","", IF(F8>=30, "Puntuación alta. Estabilizar y valorar antes de '
             'procesar trauma.", IF(F8>=20, "Zona intermedia: conviene explorar.", '
             '"Por debajo del umbral de cribado.")))')
ws['E12'].font = F(size=9, bold=True, color=CLAY_700)
ws['E12'].alignment = Alignment(wrap_text=True, vertical='top')
ws.merge_cells('E12:F12')
ws.row_dimensions[12].height = 34

# el color solo marca cuando hay algo que mirar
ws.conditional_formatting.add('F8', CellIsRule(operator='greaterThanOrEqual', formula=['30'],
                                               fill=R(CLAY_200), font=F(bold=True, color=CLAY_800)))
ws.conditional_formatting.add('F8', CellIsRule(operator='lessThan', formula=['20'],
                                               fill=R(SAGE_100), font=F(bold=True, color=SAGE_700)))
ws.conditional_formatting.add('F10', CellIsRule(operator='greaterThanOrEqual', formula=['20'],
                                                fill=R(CLAY_200), font=F(bold=True, color=CLAY_800)))

# --- cabecera de la tabla ---------------------------------------------------
for col, rot in (('A', 'Nº'), ('B', 'Ítem'), ('C', 'Respuesta %')):
    cel = ws[f'{col}{FILA_1-1}']
    cel.value = rot
    cel.font = F(size=9, bold=True, color=CLAY_700)
    cel.fill = R(CLAY_100)
    cel.alignment = Alignment(horizontal='center' if col != 'B' else 'left', vertical='center')
    cel.border = Border(bottom=Side(style='thin', color=CLAY_300))
ws.row_dimensions[FILA_1-1].height = 20

# --- los 28 ítems -----------------------------------------------------------
for n, texto in enumerate(ITEMS, 1):
    f = fila_de(n)
    es_taxon = n in DES_T
    ws[f'A{f}'] = n
    ws[f'A{f}'].font = F(size=9, bold=True, color=CLAY_600 if es_taxon else CLAY_300)
    ws[f'A{f}'].alignment = Alignment(horizontal='center', vertical='center')
    ws[f'B{f}'] = texto
    ws[f'B{f}'].font = F(size=9.5, color=INK)
    ws[f'B{f}'].alignment = Alignment(wrap_text=True, vertical='center')
    ws[f'C{f}'].font = F(size=11, bold=True, color=CLAY_800)
    ws[f'C{f}'].alignment = Alignment(horizontal='center', vertical='center')
    ws[f'C{f}'].fill = R(CANVAS)
    for col in 'ABC':
        ws[f'{col}{f}'].border = Border(bottom=linea)
        if es_taxon:
            ws[f'{col}{f}'].fill = R(TAXON_FDO if col != 'C' else CANVAS)
    ws.row_dimensions[f].height = 30 if len(texto) > 110 else 22

# solo 0, 10, 20 ... 100: escribir 37 en una celda invalidaria la media
dv = DataValidation(type='list', formula1='"0,10,20,30,40,50,60,70,80,90,100"',
                    allow_blank=True, showErrorMessage=True,
                    errorTitle='Valor no válido',
                    error='La DES-II se responde en múltiplos de 10, de 0 a 100.')
ws.add_data_validation(dv)
dv.add(f'C{FILA_1}:C{ULTIMA}')

ws[f'A{ULTIMA+2}'] = 'Los ítems sombreados (3, 5, 7, 8, 12, 13, 22 y 27) forman el DES-T.'
ws[f'A{ULTIMA+2}'].font = F(size=8, color=INK_MUTE)
ws.merge_cells(f'A{ULTIMA+2}:C{ULTIMA+2}')
ws[f'A{ULTIMA+3}'] = FUENTE
ws[f'A{ULTIMA+3}'].font = F(size=7.5, color=INK_MUTE)
ws[f'A{ULTIMA+3}'].alignment = Alignment(wrap_text=True, vertical='top')
ws.merge_cells(f'A{ULTIMA+3}:C{ULTIMA+3}')
ws.row_dimensions[ULTIMA+3].height = 22

ws.freeze_panes = f'A{FILA_1}'
ws.sheet_properties.tabColor = CLAY_600
ws.page_setup.orientation = 'portrait'
ws.page_setup.fitToWidth = 1
ws.sheet_properties.pageSetUpPr.fitToPage = True

wb.properties.creator = 'Angie Sánchez Gallego · Hogar Terapéutico'
wb.properties.title = 'DES-II · Escala de Experiencias Disociativas'
wb.save(SALIDA)
print('XLSX generado')
