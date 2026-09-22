import json
import time
import locale
from datetime import date
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException
from webdriver_manager.chrome import ChromeDriverManager

# Configurar el locale a español
try:
    locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
    print("🌍 Locale 'es_ES.UTF-8' configurado.")
except locale.Error:
    print("⚠️  Locale 'es_ES.UTF-8' no encontrado. Se usará el locale por defecto.")

def guardar_horarios_json(horarios_encontrados):
    """
    Procesa los horarios y los guarda en un archivo JSON en la carpeta public/api.
    """
    print("\n💾 Procesando y guardando horarios en formato JSON...")

    meses = {
        "ene": 1, "feb": 2, "mar": 3, "abr": 4, "may": 5, "jun": 6,
        "jul": 7, "ago": 8, "sep": 9, "oct": 10, "nov": 11, "dic": 12
    }
    
    hoy = date.today()
    horarios_procesados = []

    for fecha_str, horas in horarios_encontrados.items():
        try:
            dia_str, mes_str = fecha_str.lower().split()
            dia = int(dia_str)
            mes = meses.get(mes_str)
            if not mes: continue

            año = hoy.year
            if mes < hoy.month:
                año += 1
            
            fecha_obj = date(año, mes, dia)
            fecha_iso = fecha_obj.strftime('%Y-%m-%d')
            
            horarios_procesados.append({
                "fecha": fecha_iso,
                "horas": sorted(horas)
            })
        except (ValueError, KeyError) as e:
            print(f"⚠️ Error procesando la fecha '{fecha_str}': {e}")
            continue

    horarios_procesados.sort(key=lambda x: x["fecha"])
    
    output_path = 'public/api/horarios.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(horarios_procesados, f, ensure_ascii=False, indent=4)
        
    print(f"✅ Horarios guardados correctamente en '{output_path}'.")

# ---------------------------------------------------------------------------
# Opiniones
#
# Estaban escritas a mano en la portada. La consecuencia es la de siempre: el
# 22 de septiembre de 2026 la web ensenaba como "ultima" una del 16 de julio,
# habiendo dos de septiembre sin publicar, y el contador decia 23 cuando eran
# 25. Se raspan de la misma pagina que ya abrimos para el calendario, asi que
# no cuesta ni una carga extra.
# ---------------------------------------------------------------------------

MESES_LARGOS = {
    "enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6,
    "julio": 7, "agosto": 8, "septiembre": 9, "octubre": 10,
    "noviembre": 11, "diciembre": 12,
}

# Cuantas se publican en la portada. Se guardan algunas de mas para poder
# cambiar la seleccion sin volver a raspar.
OPINIONES_A_GUARDAR = 12


# Correcciones de texto, una por una y a la vista.
#
# Doctoralia publica lo que escribio el paciente, erratas incluidas. La
# portada venia mostrando una version corregida a mano: donde la ficha dice
# "buena atencion para agonsejar", la web decia "buena atención para
# aconsejar". Corregir una errata evidente es normal al citar un testimonio y
# ademas es mas amable con quien la escribio; hacerlo en silencio, dentro de
# un scraper, no lo es.
#
# Por eso el texto original SIEMPRE se guarda tal cual en "texto", y la
# correccion va aparte en "texto_publicado". Cada entrada de aqui es una
# decision editorial que se ve en el diff y se puede discutir.
#
# La clave es fecha + autor porque el texto cambia con la propia correccion.
CORRECCIONES = {
    ("2026-07-16", "Alejandro"):
        "Me gustó la forma de escucha, buena atención para aconsejar.",
}


def abreviar_nombre(nombre):
    """
    Doctoralia publica el nombre completo; la web de Angie no.

    Antes de esto alguien lo hacia a mano: en la ficha pone "Jose Luis
    Chicharro" y en la portada ponia "Jose Luis C.". Eso es una decision
    deliberada sobre datos de pacientes y el scraper no puede deshacerla
    por descuido, asi que se reproduce aqui.

    Solo se toca la ultima palabra, y solo si parece un apellido escrito
    entero. "Daniela M." o "A.M" se quedan como estan.
    """
    partes = nombre.split()
    if len(partes) < 2:
        return nombre
    ultima = partes[-1]
    if len(ultima.rstrip(".")) <= 2:      # ya viene abreviada
        return nombre
    return " ".join(partes[:-1]) + " " + ultima[0].upper() + "."


def fecha_a_iso(texto):
    """'18 de septiembre de 2026' -> '2026-09-18'. None si no encaja."""
    partes = texto.lower().replace(" de ", " ").split()
    if len(partes) != 3:
        return None
    try:
        dia, mes, anio = int(partes[0]), MESES_LARGOS.get(partes[1]), int(partes[2])
    except ValueError:
        return None
    if not mes:
        return None
    return "%04d-%02d-%02d" % (anio, mes, dia)


def extraer_agregado(driver):
    """
    La nota media y el total salen del JSON-LD de la propia Doctoralia, no
    del texto: el marcado estructurado cambia mucho menos que la maquetacion.
    """
    bloques = driver.find_elements(By.CSS_SELECTOR, 'script[type="application/ld+json"]')
    for b in bloques:
        try:
            datos = json.loads(b.get_attribute("textContent"))
        except (json.JSONDecodeError, TypeError):
            continue
        for obj in (datos if isinstance(datos, list) else [datos]):
            if isinstance(obj, dict) and isinstance(obj.get("aggregateRating"), dict):
                ar = obj["aggregateRating"]
                try:
                    return int(ar["reviewCount"]), float(ar["ratingValue"])
                except (KeyError, TypeError, ValueError):
                    continue
    return None, None


def extraer_opiniones(driver):
    """Devuelve la lista de opiniones, de la mas reciente a la mas antigua."""
    print("\n\U0001f5e3\ufe0f  Extrayendo opiniones...")
    bloques = driver.find_elements(By.CSS_SELECTOR, '[data-test-id="opinion-block"]')
    opiniones = []

    for bloque in bloques[:OPINIONES_A_GUARDAR]:
        try:
            texto = bloque.find_element(
                By.CSS_SELECTOR, '[data-test-id="opinion-comment"]').text.strip()
        except NoSuchElementException:
            continue                      # hay valoraciones sin comentario
        if not texto:
            continue

        # El nombre se saca del texto para lectores de pantalla porque es el
        # unico sitio donde viene completo y sin el avatar pegado delante.
        autor = ""
        try:
            sr = bloque.find_element(By.CSS_SELECTOR, ".sr-only").text
            autor = sr.replace("en opinión del usuario", "").strip()
        except NoSuchElementException:
            pass
        if not autor:
            continue

        fecha_txt = ""
        try:
            fecha_txt = bloque.find_element(By.TAG_NAME, "time").text.strip()
        except NoSuchElementException:
            pass

        verificada = False
        try:
            bloque.find_element(By.XPATH, ".//span[contains(text(),'Cita verificada')]")
            verificada = True
        except NoSuchElementException:
            pass

        fecha_iso = fecha_a_iso(fecha_txt)
        nombre = abreviar_nombre(autor)
        registro = {
            "autor": nombre,
            "fecha": fecha_iso,
            "fecha_texto": fecha_txt,
            "texto": texto,
            "verificada": verificada,
        }
        correccion = CORRECCIONES.get((fecha_iso, nombre))
        if correccion and correccion != texto:
            registro["texto_publicado"] = correccion
        opiniones.append(registro)
        print("   -> %s, %s" % (opiniones[-1]["autor"], fecha_txt or "sin fecha"))

    return opiniones


def guardar_opiniones_json(opiniones, total, media):
    """
    Escribe src/_data/opiniones.json.

    Si la extraccion viene vacia NO se escribe nada. Doctoralia cambiara su
    HTML algun dia y romperá los selectores; cuando pase, es mejor que la
    portada siga ensenando las opiniones de ayer a que se quede en blanco.
    """
    output_path = 'src/_data/opiniones.json'

    if not opiniones or not total:
        print("\u26a0\ufe0f  No se ha extraido ninguna opinion. Se conserva el archivo "
              "anterior y no se toca nada.")
        return

    datos = {
        "actualizado": date.today().isoformat(),
        "total": total,
        "media": media,
        "media_texto": ("%.1f" % media).replace(".", ","),
        "media_schema": "%.1f" % media,
        "opiniones": opiniones,
    }
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(datos, f, ensure_ascii=False, indent=4)
        f.write("\n")

    print("\u2705 %d opiniones guardadas en '%s' (total en Doctoralia: %d, media %s)."
          % (len(opiniones), output_path, total, datos["media_texto"]))


def obtener_horarios_disponibles(url):
    print("🤖 Iniciando el scraper de Doctoralia...")
    
    service = Service(ChromeDriverManager().install())
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--log-level=3')
    options.add_argument('--start-maximized')
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    
    driver = webdriver.Chrome(service=service, options=options)
    wait = WebDriverWait(driver, 15)
    horarios_encontrados = {}
    opiniones, total_opiniones, media_opiniones = [], None, None

    try:
        driver.get(url)
        try:
            cookie_button = wait.until(EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler")))
            cookie_button.click()
            print("🍪 Cookies aceptadas.")
        except TimeoutException:
            print("🍪 No se encontró el banner de cookies o ya estaba aceptado.")

        opiniones = extraer_opiniones(driver)
        total_opiniones, media_opiniones = extraer_agregado(driver)

        for i in range(10):
            print(f"\n🔍 Analizando semana {i + 1}...")
            time.sleep(2) # Pausa estratégica para que la página se estabilice
            
            # Volvemos a buscar los días visibles en cada iteración para evitar elementos "stale"
            dias_visibles = driver.find_elements(By.CSS_SELECTOR, "div.calendar-day.day-available")
            
            for dia in dias_visibles:
                try:
                    # Bucle para reintentar en caso de StaleElementReferenceException
                    for reintento in range(3):
                        try:
                            fecha_str = dia.find_element(By.CSS_SELECTOR, "p.small.text-muted").text.strip()
                            slots = dia.find_elements(By.CSS_SELECTOR, "button.calendar-slot-available")
                            if slots and fecha_str:
                                horas = [s.text.strip() for s in slots if s.text.strip()]
                                if fecha_str not in horarios_encontrados:
                                    horarios_encontrados[fecha_str] = horas
                                    print(f"   -> Encontrados {len(horas)} horarios para el {fecha_str}.")
                            break # Si todo va bien, salimos del bucle de reintentos
                        except StaleElementReferenceException:
                            print(f"   ... Elemento 'stale' detectado, reintentando ({reintento + 1}/3)...")
                            time.sleep(0.5)
                            # Es crucial volver a encontrar el elemento 'dia' dentro del DOM actual
                            dias_visibles = driver.find_elements(By.CSS_SELECTOR, "div.calendar-day.day-available")
                            if i < len(dias_visibles):
                                dia = dias_visibles[i] # Intenta reasignar el elemento
                            else:
                                break # Si ya no se encuentra, pasa al siguiente
                except NoSuchElementException:
                    continue # Si un día no tiene los elementos esperados, lo ignoramos
            
            if i < 9:
                try:
                    next_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Next']")))
                    driver.execute_script("arguments[0].click();", next_button)
                    print("   ➡️  Pasando a la siguiente semana...")
                except (NoSuchElementException, TimeoutException):
                    print("⚠️ No se pudo encontrar el botón de 'siguiente'.")
                    break
    finally:
        driver.quit()
        print("\n✅ Proceso de scraping finalizado.")
    
    guardar_horarios_json(horarios_encontrados)
    guardar_opiniones_json(opiniones, total_opiniones, media_opiniones)

if __name__ == "__main__":
    URL_ANGIE_SANCHEZ = "https://www.doctoralia.es/angie-sanchez-gallego/psicologo/madrid"
    obtener_horarios_disponibles(URL_ANGIE_SANCHEZ)