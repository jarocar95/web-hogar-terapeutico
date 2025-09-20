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

    try:
        driver.get(url)
        try:
            cookie_button = wait.until(EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler")))
            cookie_button.click()
            print("🍪 Cookies aceptadas.")
        except TimeoutException:
            print("🍪 No se encontró el banner de cookies o ya estaba aceptado.")

        for i in range(5):
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
            
            if i < 4:
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

if __name__ == "__main__":
    URL_ANGIE_SANCHEZ = "https://www.doctoralia.es/angie-sanchez-gallego/psicologo/madrid"
    obtener_horarios_disponibles(URL_ANGIE_SANCHEZ)